from django.db import models
from django.contrib.auth.models import User


class Profession(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'professions'
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="employee"
    )

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    profession = models.ForeignKey(
        Profession,
        on_delete=models.PROTECT,
        related_name='employees',
        null=True,
        blank=True
    )
    last_visited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.email
