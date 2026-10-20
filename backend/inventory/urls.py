from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CategoriesViewSet, ProductsViewSet, UploadsViewSet, WishlistViewSet, api_logout, export_backup, reminder_settings, restore_backup, user_profile
router = DefaultRouter()
router.register('categories', CategoriesViewSet, basename='categories')
router.register('products', ProductsViewSet, basename='products')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('attachments', UploadsViewSet, basename='attachments')
urlpatterns = [path('reminders/', reminder_settings), path('profile/', user_profile), path('logout/', api_logout), path('export/', export_backup), path('restore/', restore_backup)] + router.urls
