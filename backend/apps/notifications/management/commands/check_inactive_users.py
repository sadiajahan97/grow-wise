from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from zoneinfo import ZoneInfo
from apps.employees.models import Employee
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = 'Create notifications for employees who have not visited in over one month'

    def handle(self, *args, **options):
        # Get the current date and time in Bangladesh timezone (Asia/Dhaka)
        current_datetime = timezone.now()
        bangladesh_tz = ZoneInfo('Asia/Dhaka')
        bangladesh_datetime = current_datetime.astimezone(bangladesh_tz)
        formatted_datetime = bangladesh_datetime.strftime('%Y-%m-%d %H:%M:%S')
        
        self.stdout.write(f'\n=== Running check_inactive_users at {formatted_datetime} ===\n')
        
        # Calculate the date one month ago
        one_month_ago = timezone.now() - timedelta(days=30)
        
        # Find employees who haven't visited in over one month
        inactive_employees = Employee.objects.filter(
            last_visited_at__lt=one_month_ago
        )
        
        notification_message = "You haven't visited GrowWise in over a month. We miss you! Come back and continue your growth journey."
        
        created_count = 0
        
        for employee in inactive_employees:
            # Check if a notification already exists for this employee with the same message
            # to avoid creating duplicate notifications
            existing_notification = Notification.objects.filter(
                employee=employee,
                message=notification_message,
                is_read=False
            ).first()
            
            if not existing_notification:
                Notification.objects.create(
                    employee=employee,
                    message=notification_message,
                    is_read=False
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created notification for {employee.email}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n[{formatted_datetime}] Successfully created {created_count} notification(s) for inactive users.'
            )
        )

