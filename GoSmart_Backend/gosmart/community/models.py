from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from tracking.models import Bus


class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='ratings')
    cleanliness = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    safety = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} -> {self.bus.plate_no} (clean {self.cleanliness}, safety {self.safety})"


class TrafficReport(models.Model):
    SEVERITY_CHOICES = (
        ('light', 'Light'),
        ('moderate', 'Moderate'),
        ('heavy', 'Heavy'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='traffic_reports')
    location = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)  # admin marks as reviewed instead of only deleting

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.location} - {self.severity}"