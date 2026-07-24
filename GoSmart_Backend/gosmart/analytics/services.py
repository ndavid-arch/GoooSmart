"""
Business logic triggered by each GPS ping (tracking.views.GPSUpdateView), kept out of the
view so the request/response handling there stays thin. Two independent jobs run on every
ping:

1. record_leg_arrival(bus) - delay tracking. If the bus has just come within
   ARRIVAL_RADIUS_KM of the next scheduled stop on its route, log actual-vs-scheduled travel
   time for that leg (DelayLog) and advance the bus's "last stop reached" pointer.
2. check_eta_alerts(bus) - notifies passengers who asked to be alerted when this bus is
   close to a chosen stop (EtaAlert), via Web Push.

Both are intentionally simple polling-time checks, not a background job - there is no
Celery/cron in this project, so anything time-based has to piggyback on a real request.
"""
from django.utils import timezone

from routes.models import RouteStop
from tracking.utils import haversine_km, estimate_eta_minutes
from .models import DelayLog, EtaAlert
from .push import send_push_to_user

ARRIVAL_RADIUS_KM = 0.15  # ~150m: close enough to count as "reached" a stop
DELAY_ALERT_THRESHOLD_MINUTES = 5  # only push a delay alert once a leg is this late

def _format_duration(total_minutes):
    """Human-readable duration: '3 min', '2 hr 15 min', '1 day 4 hr 2 min'."""
    total_minutes = int(round(total_minutes))
    days, remainder = divmod(total_minutes, 1440)
    hours, minutes = divmod(remainder, 60)

    parts = []
    if days:
        parts.append(f"{days} day{'s' if days != 1 else ''}")
    if hours:
        parts.append(f"{hours} hr{'s' if hours != 1 else ''}")
    if minutes or not parts:
        parts.append(f"{minutes} min")
    return " ".join(parts)


def _next_route_stop(bus):
    """The RouteStop the bus should reach next, based on its last logged arrival."""
    if not bus.route_id:
        return None
    qs = RouteStop.objects.filter(route_id=bus.route_id).order_by('stop_order')
    if bus.last_stop_reached_id is None:
        return qs.first()
    last = qs.filter(stop_id=bus.last_stop_reached_id).first()
    if last is None:
        return qs.first()
    return qs.filter(stop_order__gt=last.stop_order).first()


def record_leg_arrival(bus):
    """Detect arrival at the next scheduled stop and log actual-vs-scheduled leg time."""
    if bus.current_lat is None or bus.current_lng is None:
        return

    target = _next_route_stop(bus)
    if target is None:
        return

    distance_km = haversine_km(bus.current_lat, bus.current_lng, target.stop.latitude, target.stop.longitude)
    if distance_km > ARRIVAL_RADIUS_KM:
        return

    now = timezone.now()

    if bus.last_stop_reached_at is not None and target.scheduled_leg_minutes is not None:
        actual_minutes = round((now - bus.last_stop_reached_at).total_seconds() / 60, 1)
        delay_minutes = round(actual_minutes - target.scheduled_leg_minutes, 1)
        DelayLog.objects.create(
            bus=bus,
            route=bus.route,
            route_stop=target,
            scheduled_minutes=target.scheduled_leg_minutes,
            actual_minutes=actual_minutes,
            delay_minutes=delay_minutes,
            recorded_at=now,
        )
        if delay_minutes >= DELAY_ALERT_THRESHOLD_MINUTES:
            _notify_delay(bus, target, delay_minutes)

    bus.last_stop_reached = target.stop
    bus.last_stop_reached_at = now
    bus.save(update_fields=['last_stop_reached', 'last_stop_reached_at'])


def _notify_delay(bus, route_stop, delay_minutes):
    alerts = EtaAlert.objects.filter(
        bus=bus, stop=route_stop.stop, delay_notified_at__isnull=True
    ).select_related('user')
    formatted_delay = _format_duration(delay_minutes)
    for alert in alerts:
        send_push_to_user(alert.user, {
            'title': f'{bus.plate_no} has arrived late',
            'body': f'Arrived about {formatted_delay} behind schedule at {route_stop.stop.stop_name}.',
        })
        alert.delay_notified_at = timezone.now()
        alert.save(update_fields=['delay_notified_at'])

def check_eta_alerts(bus):
    """One-shot push when a bus comes within a passenger's requested ETA window of their stop."""
    if bus.current_lat is None or bus.current_lng is None:
        return

    alerts = EtaAlert.objects.filter(bus=bus, notified_at__isnull=True).select_related('user', 'stop')
    if not alerts:
        return

    now = timezone.now()
    for alert in alerts:
        eta_minutes, _distance_km = estimate_eta_minutes(
            bus.current_lat, bus.current_lng, alert.stop.latitude, alert.stop.longitude
        )
        if eta_minutes <= alert.threshold_minutes:
            send_push_to_user(alert.user, {
                'title': f'{bus.plate_no} is almost there',
                'body': f'About {eta_minutes:.0f} min from {alert.stop.stop_name}.',
            })
            alert.notified_at = now
            alert.save(update_fields=['notified_at'])