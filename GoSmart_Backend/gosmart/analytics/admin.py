from django.contrib import admin

from .models import DelayLog, EtaAlert, PushSubscription, Ridership


@admin.register(Ridership)
class RidershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'bus', 'route', 'created_at']
    list_filter = ['route']


@admin.register(DelayLog)
class DelayLogAdmin(admin.ModelAdmin):
    list_display = ['bus', 'route', 'route_stop', 'scheduled_minutes', 'actual_minutes', 'delay_minutes', 'recorded_at']
    list_filter = ['route']


@admin.register(EtaAlert)
class EtaAlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'bus', 'stop', 'threshold_minutes', 'created_at', 'notified_at']


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'endpoint', 'created_at']