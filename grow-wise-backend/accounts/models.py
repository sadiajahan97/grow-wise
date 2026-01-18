from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # remove username uniqueness issues
    username = models.CharField(max_length=150, blank=True, null=True)

    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    department = models.CharField(max_length=255)

    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'designation', 'department']

    def __str__(self):
        return self.email
