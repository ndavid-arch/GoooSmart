from django.conf import settings
from django.db import models
from routes.models import Route, Stop


class Bus(models.Model):
    plate_no = models.CharField(max_length=20, unique=True)
    capacity = models.PositiveIntegerField()
    route = models.ForeignKey(
        Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='buses'
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='buses', limit_choices_to={'role': 'driver'}
    )
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)
    last_stop_reached = models.ForeignKey(
        Stop, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    last_stop_reached_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.plate_no
    