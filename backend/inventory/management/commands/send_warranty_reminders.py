from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from inventory.models import Product, ReminderSettings, WARRANTY_REMINDER_DAYS

class Command(BaseCommand):
    help = 'Send daily emails for warranties reaching a configured reminder date.'

    def handle(self, *args, **options):
        today = timezone.localdate()
        sent = 0
        active = ['owned', 'missing', 'lent']
        preferences = ReminderSettings.objects.filter(enabled=True, user__email__gt='').select_related('user')
        for preference in preferences:
            for days in WARRANTY_REMINDER_DAYS:
                target_date = today + timedelta(days=days)
                products = Product.objects.filter(user=preference.user, warranty_end=target_date, status__in=active)
                if not products.exists():
                    continue
                names = '\n'.join(f'- {product.name} (warranty ends {product.warranty_end})' for product in products)
                if days == 1:
                    lead = 'expires tomorrow'
                else:
                    lead = f'expires in {days} days'
                send_mail(
                    subject=f'HomeKeeper: warranty {lead}',
                    message=f'These warranties {lead}:\n\n{names}\n\nReview your HomeKeeper inventory for details.',
                    from_email=None,
                    recipient_list=[preference.user.email],
                    fail_silently=False,
                )
                sent += 1
        self.stdout.write(self.style.SUCCESS(f'Sent {sent} warranty reminder email(s).'))


