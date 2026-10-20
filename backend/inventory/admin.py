from django.contrib import admin
from .models import Category,Product,Attachment,WishlistItem
admin.site.register([Category,Product,Attachment,WishlistItem])
