from django.urls import reverse
from rest_framework import serializers

from .models import Attachment, Category, Product, WishlistItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'file', 'kind']

    def get_file(self, obj):
        request = self.context.get('request')
        if not request:
            return obj.file.url

        return request.build_absolute_uri(
            reverse('attachment-file', args=[obj.id]),
        )


class ProductSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['user']

    def validate_category(self, category):
        if category:
            request_user = self.context['request'].user
            if category.user_id != request_user.id:
                raise serializers.ValidationError('Invalid category')
        return category


class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = WishlistItem
        fields = '__all__'
        read_only_fields = ['user']


class UploadSerializer(AttachmentSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'product', 'file', 'kind']
