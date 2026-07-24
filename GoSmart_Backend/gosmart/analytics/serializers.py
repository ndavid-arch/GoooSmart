from rest_framework import serializers

from .models import Ridership, EtaAlert, PushSubscription


class RidershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    route_name = serializers.CharField(source='route.route_name', read_only=True, default=None)

    class Meta:
        model = Ridership
        fields = ['id', 'user', 'username', 'bus', 'route', 'route_name', 'created_at']
        read_only_fields = ['user', 'route', 'created_at']


class EtaAlertSerializer(serializers.ModelSerializer):
    stop_name = serializers.CharField(source='stop.stop_name', read_only=True)
    bus_plate_no = serializers.CharField(source='bus.plate_no', read_only=True)

    class Meta:
        model = EtaAlert
        fields = ['id', 'bus', 'bus_plate_no', 'stop', 'stop_name', 'threshold_minutes', 'created_at', 'notified_at']
        read_only_fields = ['created_at', 'notified_at']


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['id', 'endpoint', 'p256dh', 'auth']