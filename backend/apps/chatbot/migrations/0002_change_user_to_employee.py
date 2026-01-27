# Generated manually to change user ForeignKey to employee ForeignKey

import django.db.models.deletion
from django.db import migrations, models


def migrate_user_to_employee(apps, schema_editor):
    """
    Migrate existing ChatThread records from user to employee.
    """
    ChatThread = apps.get_model('chatbot', 'ChatThread')
    Employee = apps.get_model('employees', 'Employee')
    
    for thread in ChatThread.objects.all():
        try:
            # Get the employee associated with the user
            employee = Employee.objects.get(user=thread.user)
            thread.employee = employee
            thread.save()
        except Employee.DoesNotExist:
            # If no employee exists for this user, delete the thread
            # (or you could skip it - adjust based on your needs)
            thread.delete()


def reverse_migrate_employee_to_user(apps, schema_editor):
    """
    Reverse migration: migrate employee back to user.
    """
    ChatThread = apps.get_model('chatbot', 'ChatThread')
    
    for thread in ChatThread.objects.all():
        if thread.employee:
            thread.user = thread.employee.user
            thread.save()


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0001_initial'),
        ('employees', '0005_add_profession'),  # Adjust to your latest employees migration
    ]

    operations = [
        # Step 1: Add employee field as nullable
        migrations.AddField(
            model_name='chatthread',
            name='employee',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='chat_threads',
                to='employees.employee'
            ),
        ),
        # Step 2: Migrate data from user to employee
        migrations.RunPython(migrate_user_to_employee, reverse_migrate_employee_to_user),
        # Step 3: Remove user field
        migrations.RemoveField(
            model_name='chatthread',
            name='user',
        ),
        # Step 4: Make employee field non-nullable
        migrations.AlterField(
            model_name='chatthread',
            name='employee',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='chat_threads',
                to='employees.employee'
            ),
        ),
    ]

