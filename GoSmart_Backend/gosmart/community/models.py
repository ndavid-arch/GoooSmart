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


class BusReport(models.Model):
    """
    A quick, categorical report filed by a passenger who is currently aboard.

    Every dimension is optional — a rider may flag only what they noticed — but
    at least one must be set (enforced in the serializer). Kept separate from
    Rating: a Rating is a considered 1-5 score of the ride, this is a fast
    "what is it like on here right now" signal, like a TrafficReport.
    """

    LEVEL_CHOICES = (
        ('good', 'Good'),
        ('moderate', 'Moderate'),
        ('bad', 'Bad'),
    )
    # How long after tapping "I'm on this bus" a rider may still file a report.
    BOARDING_WINDOW_MINUTES = 180

    DIMENSIONS = ('cleanliness', 'crowding', 'driving')

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bus_reports')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='bus_reports')
    # good = clean / spacious / smooth,  bad = dirty / packed / reckless
    cleanliness = models.CharField(max_length=10, choices=LEVEL_CHOICES, blank=True, default='')
    crowding = models.CharField(max_length=10, choices=LEVEL_CHOICES, blank=True, default='')
    driving = models.CharField(max_length=10, choices=LEVEL_CHOICES, blank=True, default='')
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['bus', 'created_at'])]

    def __str__(self):
        flagged = ', '.join(f'{d} {getattr(self, d)}' for d in self.DIMENSIONS if getattr(self, d))
        return f"{self.user.username} -> {self.bus.plate_no} ({flagged})"


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