from django.utils import timezone
from rest_framework import serializers
from .models import Bus


class BusSerializer(serializers.ModelSerializer):
    route_name = serializers.CharField(source='route.route_name', read_only=True, default=None)
    driver_name = serializers.CharField(source='driver.username', read_only=True, default=None)
    is_live = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = [
            'id', 'plate_no', 'capacity', 'route', 'route_name', 'driver', 'driver_name',
            'current_lat', 'current_lng', 'last_updated', 'is_live',
        ]
        read_only_fields = ['current_lat', 'current_lng', 'last_updated']

    def get_is_live(self, obj):
        # "live" = GPS updated within the last 2 minutes; otherwise treat as stale/offline
        if not obj.last_updated:
            return False
        return (timezone.now() - obj.last_updated).total_seconds() < 120


class GPSUpdateSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)