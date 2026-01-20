# Generated manually

from django.db import migrations, models


def delete_null_link_certifications(apps, schema_editor):
    """Delete any certifications with null links since they're invalid."""
    Certification = apps.get_model('certifications', 'Certification')
    Certification.objects.filter(link__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('certifications', '0002_simplify_certifications'),
    ]

    operations = [
        migrations.RunPython(delete_null_link_certifications, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='certification',
            name='link',
            field=models.URLField(max_length=500),
        ),
    ]

