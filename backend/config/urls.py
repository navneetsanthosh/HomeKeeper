from django.contrib import admin
from pathlib import Path
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from inventory.views import attachment_file, csrf, health_check, signup, api_login

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/csrf/', csrf),
    path('api/signup/', signup),
    path('api/login/', api_login),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/attachments/<int:attachment_id>/file/', attachment_file, name='attachment-file'),
    path('api/', include('inventory.urls')),
]

BASE_WEB_INDEX = Path(__file__).resolve().parent.parent / 'static-web' / 'index.html'
if BASE_WEB_INDEX.exists():
    urlpatterns.append(re_path(
        r'^(?!api/|admin/|health/|static/|media/).*$',
        TemplateView.as_view(template_name='index.html'),
        name='web-app',
    ))
