from django.db import models
from apps.employees.models import Employee


class Certification(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='certifications'
    )
    link = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'certifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.email} - {self.link}"

