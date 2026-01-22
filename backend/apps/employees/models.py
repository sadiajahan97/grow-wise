from django.db import models
from django.contrib.auth.models import User
from apps.organization.models import Department, Designation

class Employee(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee"
    )

    staff_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)

    department = models.ForeignKey(Department, on_delete=models.PROTECT)
    designation = models.ForeignKey(Designation, on_delete=models.PROTECT)
    last_visited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.staff_id
