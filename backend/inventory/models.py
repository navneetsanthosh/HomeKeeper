from django.db import models
from django.conf import settings
WARRANTY_REMINDER_DAYS = (30, 7, 1)

class Category(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=80)
    class Meta:
        unique_together = ('user', 'name')
    def __str__(self): return self.name

class Product(models.Model):
    STATUS = [('owned','Owned'),('missing','Missing'),('lent','Lent out'),('sold','Sold'),('disposed','Disposed')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=160)
    brand = models.CharField(max_length=120, blank=True)
    model_number = models.CharField(max_length=120, blank=True)
    serial_number = models.CharField(max_length=120, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_end = models.DateField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS, default='owned')
    notes = models.TextField(blank=True)

class Attachment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='uploads/')
    kind = models.CharField(max_length=8, choices=[('bill','Bill'),('photo','Photo')], default='bill')

class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=160)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

class ReminderSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reminder_settings')
    enabled = models.BooleanField(default=False)



