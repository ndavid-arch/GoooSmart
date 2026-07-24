from django.conf import settings
from django.db import models

from routes.models import Route, RouteStop, Stop
from tracking.models import Bus


class Ridership(models.Model):
    """One row per passenger 'I'm on this bus' tap-in. Basis for the ridership dashboard."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ridership_taps')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='ridership_events')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='ridership_events')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['route', 'created_at']),
            models.Index(fields=['bus', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} boarded {self.bus.plate_no} at {self.created_at:%Y-%m-%d %H:%M}"


class DelayLog(models.Model):
    """
    Auto-recorded whenever a bus's GPS update lands within arrival range of the next
    scheduled stop on its route. Compares actual travel time for that leg (since the
    previous stop was reached) against RouteStop.scheduled_leg_minutes.
    """

    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='delay_logs')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='delay_logs')
    route_stop = models.ForeignKey(RouteStop, on_delete=models.SET_NULL, null=True, blank=True, related_name='delay_logs')
    scheduled_minutes = models.FloatField()
    actual_minutes = models.FloatField()
    delay_minutes = models.FloatField()  # actual - scheduled; negative means early
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['route', 'recorded_at']),
            models.Index(fields=['bus', 'recorded_at']),
        ]

    def __str__(self):
        return f"{self.bus.plate_no} leg delay {self.delay_minutes:+.1f}min @ {self.recorded_at:%Y-%m-%d %H:%M}"


class EtaAlert(models.Model):
    """A passenger's one-shot request to be push-notified when a bus nears a stop, or is running late."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='eta_alerts')
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='eta_alerts')
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='eta_alerts')
    threshold_minutes = models.PositiveIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    # Separate from notified_at (proximity) so a delay push and a proximity push don't
    # consume the same "already notified" flag - a rider can get both, independently.
    delay_notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Alert: {self.user.username} <- {self.bus.plate_no} near {self.stop.stop_name}"

class PushSubscription(models.Model):
    """A browser Web Push subscription (service worker endpoint + keys) for one user."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='push_subscriptions')
    endpoint = models.URLField(max_length=500, unique=True)
    p256dh = models.CharField(max_length=255)
    auth = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Push subscription for {self.user.username}"