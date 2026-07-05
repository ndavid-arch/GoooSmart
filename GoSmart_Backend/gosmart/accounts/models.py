# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='passenger')
    phone = models.CharField(max_length=20, blank=True, null=True)
    license_no = models.CharField(max_length=50, blank=True, null=True)  # only used if role='driver'

    def __str__(self):
        return f"{self.username} ({self.role})"