from django.contrib.auth import authenticate, login, logout, get_user_model
import csv
from io import BytesIO, StringIO, TextIOWrapper
from pathlib import PurePosixPath
import re
from zipfile import BadZipFile, ZIP_DEFLATED, ZipFile
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.validators import validate_email
from django.http import FileResponse, HttpResponse, JsonResponse
from django.db import transaction
from django.shortcuts import get_object_or_404
import mimetypes
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, serializers, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Attachment, Category, Product, ReminderSettings, WARRANTY_REMINDER_DAYS, WishlistItem
from .serializers import (
    AttachmentSerializer,
    CategorySerializer,
    ProductSerializer,
    UploadSerializer,
    WishlistSerializer,
)

@ensure_csrf_cookie
def csrf(request): return JsonResponse({'ok': True})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup(request):
    User = get_user_model()
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    if not username or len(password) < 8:
        return Response({'detail': 'Username required; password must be 8+ characters.'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username already exists.'}, status=400)
    user = User.objects.create_user(username=username, password=password)
    login(request, user)
    return Response({'username': user.username}, status=201)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def api_login(request):
    user = authenticate(request, username=request.data.get('username'), password=request.data.get('password'))
    if not user: return Response({'detail': 'Invalid username or password.'}, status=400)
    login(request, user)
    return Response({'username': user.username})

@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response({'detail': 'Signed out.'})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({'status': 'ok'})

@api_view(['GET'])
def attachment_file(request, attachment_id):
    attachment = get_object_or_404(
        Attachment.objects.select_related('product'),
        pk=attachment_id, user=request.user, product__user=request.user,
    )
    try:
        file_handle = attachment.file.open('rb')
    except (OSError, ValueError):
        return Response({'detail': 'This attachment is not available.'}, status=404)
    content_type = mimetypes.guess_type(attachment.file.name)[0] or 'application/octet-stream'
    response = FileResponse(file_handle, content_type=content_type)
    response['Content-Disposition'] = 'inline'
    response['X-Content-Type-Options'] = 'nosniff'
    return response

@api_view(['GET', 'PATCH'])
def user_profile(request):
    user = request.user
    if request.method == 'PATCH':
        first_name = request.data.get('first_name', user.first_name)
        last_name = request.data.get('last_name', user.last_name)
        email = request.data.get('email', user.email)
        if not all(isinstance(value, str) for value in (first_name, last_name, email)):
            return Response({'detail': 'Name and email fields must be text.'}, status=400)
        first_name, last_name, email = first_name.strip(), last_name.strip(), email.strip()
        if len(first_name) > 150 or len(last_name) > 150:
            return Response({'detail': 'Names must be 150 characters or fewer.'}, status=400)
        if email:
            try: validate_email(email)
            except ValidationError: return Response({'detail': 'Enter a valid email address.'}, status=400)
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.save(update_fields=['first_name', 'last_name', 'email'])
    return Response({
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
    })

@api_view(['GET'])
def export_backup(request):
    """Return a ZIP containing this user's inventory CSV and uploaded files."""
    products = list(
        Product.objects.filter(user=request.user)
        .select_related('category')
        .prefetch_related('attachments')
        .order_by('id')
    )
    buffer = BytesIO()
    csv_buffer = StringIO(newline='')
    writer = csv.writer(csv_buffer)
    writer.writerow([
        'ID', 'Name', 'Category', 'Brand', 'Model number', 'Serial number',
        'Purchase date', 'Warranty end', 'Price', 'Status', 'Notes', 'Attachments',
    ])

    def safe_csv(value):
        value = '' if value is None else str(value)
        return "'" + value if value.lstrip().startswith(('=', '+', '-', '@')) else value

    category_buffer = StringIO(newline='')
    category_writer = csv.writer(category_buffer)
    category_writer.writerow(['ID', 'Name'])
    for category in Category.objects.filter(user=request.user).order_by('id'):
        category_writer.writerow([safe_csv(category.id), safe_csv(category.name)])

    wishlist_buffer = StringIO(newline='')
    wishlist_writer = csv.writer(wishlist_buffer)
    wishlist_writer.writerow(['ID', 'Name', 'Category', 'Estimated price', 'Notes'])
    for item in WishlistItem.objects.filter(user=request.user).select_related('category').order_by('id'):
        wishlist_writer.writerow([
            safe_csv(item.id), safe_csv(item.name),
            safe_csv(item.category.name if item.category else ''),
            safe_csv(item.estimated_price), safe_csv(item.notes),
        ])

    with ZipFile(buffer, 'w', ZIP_DEFLATED) as archive:
        for product in products:
            paths = []
            for attachment in product.attachments.all():
                try:
                    attachment.file.open('rb')
                    filename = PurePosixPath(attachment.file.name).name
                    filename = re.sub(r'[^A-Za-z0-9._-]+', '_', filename) or 'attachment'
                    archive_path = f'attachments/{product.id}/{attachment.kind}-{attachment.id}-{filename}'
                    archive.writestr(archive_path, attachment.file.read())
                    paths.append(archive_path)
                except (OSError, ValueError):
                    continue
                finally:
                    try:
                        attachment.file.close()
                    except (OSError, ValueError):
                        pass
            writer.writerow([
                safe_csv(product.id), safe_csv(product.name),
                safe_csv(product.category.name if product.category else ''),
                safe_csv(product.brand), safe_csv(product.model_number),
                safe_csv(product.serial_number), safe_csv(product.purchase_date),
                safe_csv(product.warranty_end), safe_csv(product.price),
                safe_csv(product.status), safe_csv(product.notes),
                safe_csv('; '.join(paths)),
            ])
        archive.writestr('inventory.csv', '\ufeff' + csv_buffer.getvalue())
        archive.writestr('categories.csv', '\ufeff' + category_buffer.getvalue())
        archive.writestr('bucket-list.csv', '\ufeff' + wishlist_buffer.getvalue())
        archive.writestr(
            'README.txt',
            'HomeKeeper backup\n\n'
            'inventory.csv contains your product details. categories.csv contains your categories. '
            'bucket-list.csv contains saved items you may want to buy. The attachments folder '
            'contains bills and product photos saved with your products. Keep this ZIP file private.\n',
        )

    response = HttpResponse(buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename="homekeeper-backup.zip"'
    return response

@api_view(['POST'])
def restore_backup(request):
    """Replace this user's data with the contents of a confirmed HomeKeeper ZIP."""
    if request.data.get('confirm_replace') != 'true':
        return Response({'detail': 'Confirm that you want to replace your current data.'}, status=400)
    uploaded = request.FILES.get('backup')
    if not uploaded:
        return Response({'detail': 'Choose a HomeKeeper backup ZIP file.'}, status=400)
    if uploaded.size > 100 * 1024 * 1024:
        return Response({'detail': 'Backup ZIP files must be smaller than 100 MB.'}, status=400)

    try:
        archive = ZipFile(uploaded)
    except (BadZipFile, OSError):
        return Response({'detail': 'That file is not a valid ZIP archive.'}, status=400)

    with archive:
        members = {info.filename: info for info in archive.infolist() if not info.is_dir()}
        if len(members) > 10000 or sum(info.file_size for info in members.values()) > 500 * 1024 * 1024:
            return Response({'detail': 'This backup contains too many or too-large files.'}, status=400)
        for name in members:
            path = PurePosixPath(name)
            if path.is_absolute() or '..' in path.parts or '\\' in name:
                return Response({'detail': 'The backup contains an unsafe file path.'}, status=400)
        if 'inventory.csv' not in members:
            return Response({'detail': 'This ZIP does not contain a HomeKeeper inventory.csv file.'}, status=400)

        def read_rows(filename):
            if filename not in members:
                return []
            with archive.open(filename) as file:
                return list(csv.DictReader(TextIOWrapper(file, encoding='utf-8-sig', newline='')))

        try:
            product_rows = read_rows('inventory.csv')
            category_rows = read_rows('categories.csv')
            wishlist_rows = read_rows('bucket-list.csv')
        except (UnicodeDecodeError, csv.Error):
            return Response({'detail': 'The backup CSV files could not be read.'}, status=400)
        if len(product_rows) + len(category_rows) + len(wishlist_rows) > 10000:
            return Response({'detail': 'The backup contains too many records.'}, status=400)

        attachments_by_product = {}
        for row in product_rows:
            old_id = row.get('ID', '')
            paths = [path.strip() for path in row.get('Attachments', '').split(';') if path.strip()]
            for path in paths:
                info = members.get(path)
                parts = PurePosixPath(path).parts
                if not info or len(parts) < 3 or parts[0] != 'attachments' or parts[1] != old_id:
                    return Response({'detail': 'The backup is missing an attachment or has an invalid attachment path.'}, status=400)
                filename = parts[-1]
                kind = filename.split('-', 1)[0]
                if kind not in ('bill', 'photo'):
                    return Response({'detail': 'The backup contains an unknown attachment type.'}, status=400)
                attachments_by_product.setdefault(old_id, []).append((path, kind, filename))

        def original_value(value):
            value = '' if value is None else str(value)
            return value[1:] if len(value) > 1 and value[0] == "'" and value[1] in '=+-@' else value

        user = request.user
        storage = Attachment._meta.get_field('file').storage
        old_files = list(Attachment.objects.filter(user=user).exclude(file='').values_list('file', flat=True))
        category_id_map = {}
        category_name_map = {}
        product_id_map = {}
        try:
            with transaction.atomic():
                Product.objects.filter(user=user).delete()
                WishlistItem.objects.filter(user=user).delete()
                Category.objects.filter(user=user).delete()

                for row in category_rows:
                    category_name = original_value(row.get('Name', '')).strip()
                    category = Category.objects.create(user=user, name=category_name)
                    category_id_map[row.get('ID', '')] = category.id
                    category_name_map[category_name] = category.id

                for row in product_rows:
                    payload = {
                        'name': original_value(row.get('Name', '')).strip(),
                        'brand': original_value(row.get('Brand', '')),
                        'model_number': original_value(row.get('Model number', '')),
                        'serial_number': original_value(row.get('Serial number', '')),
                        'purchase_date': original_value(row.get('Purchase date', '')) or None,
                        'warranty_end': original_value(row.get('Warranty end', '')) or None,
                        'price': original_value(row.get('Price', '')) or None,
                        'status': original_value(row.get('Status', 'owned')) or 'owned',
                        'notes': original_value(row.get('Notes', '')),
                        'category': category_name_map.get(original_value(row.get('Category', '')).strip()),
                    }
                    serializer = ProductSerializer(data=payload, context={'request': request})
                    serializer.is_valid(raise_exception=True)
                    product = serializer.save(user=user)
                    product_id_map[row.get('ID', '')] = product

                for row in wishlist_rows:
                    category_id = category_name_map.get(original_value(row.get('Category', '')).strip())
                    serializer = WishlistSerializer(data={
                        'name': original_value(row.get('Name', '')).strip(),
                        'category': category_id,
                        'estimated_price': original_value(row.get('Estimated price', '')) or None,
                        'notes': original_value(row.get('Notes', '')),
                    })
                    serializer.is_valid(raise_exception=True)
                    serializer.save(user=user)

                for old_id, product in product_id_map.items():
                    for path, kind, filename in attachments_by_product.get(old_id, []):
                        Attachment.objects.create(
                            user=user, product=product, kind=kind,
                            file=ContentFile(archive.read(path), name=filename.split('-', 2)[-1]),
                        )

                for old_name in old_files:
                    transaction.on_commit(lambda name=old_name: storage.delete(name))
        except serializers.ValidationError:
            raise
        except (ValueError, KeyError, OSError, BadZipFile):
            return Response({'detail': 'The backup data is incomplete or invalid. Your current data was not replaced.'}, status=400)

    return Response({
        'detail': 'Backup restored. Your previous HomeKeeper data was replaced.',
        'products': len(product_id_map),
        'categories': len(category_id_map),
        'bucket_list': len(wishlist_rows),
    })

@api_view(['GET', 'PATCH'])
def reminder_settings(request):
    settings, _ = ReminderSettings.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response({'email': request.user.email, 'enabled': settings.enabled, 'reminder_days': list(WARRANTY_REMINDER_DAYS)})
    email = request.data.get('email', request.user.email).strip()
    if email:
        try: validate_email(email)
        except ValidationError: return Response({'detail': 'Enter a valid email address.'}, status=400)
    enabled = request.data.get('enabled', settings.enabled)
    if not isinstance(enabled, bool): return Response({'detail': 'Enabled must be true or false.'}, status=400)
    if enabled and not email: return Response({'detail': 'Add an email address before enabling reminders.'}, status=400)
    request.user.email = email
    request.user.save(update_fields=['email'])
    settings.enabled = enabled
    settings.save(update_fields=['enabled'])
    return Response({'email': request.user.email, 'enabled': settings.enabled, 'reminder_days': list(WARRANTY_REMINDER_DAYS)})

class BaseViewSet(viewsets.ModelViewSet):
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CategoriesViewSet(BaseViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)


class ProductsViewSet(BaseViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user).prefetch_related('attachments')


class WishlistViewSet(BaseViewSet):
    serializer_class = WishlistSerializer

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)


class UploadsViewSet(BaseViewSet):
    serializer_class = UploadSerializer

    def get_queryset(self):
        return Attachment.objects.filter(
            user=self.request.user,
            product__user=self.request.user,
        )

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        if product.user_id != self.request.user.id:
            raise PermissionDenied()
        serializer.save(user=self.request.user)



