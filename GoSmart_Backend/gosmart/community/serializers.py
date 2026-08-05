from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from analytics.models import Ridership
from .models import BusReport, Rating, TrafficReport


class RatingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    bus_plate = serializers.CharField(source='bus.plate_no', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'username', 'bus', 'bus_plate', 'cleanliness', 'safety', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']


class BusReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    bus_plate = serializers.CharField(source='bus.plate_no', read_only=True)
    route_name = serializers.CharField(source='bus.route.route_name', read_only=True, default=None)
    route_number = serializers.CharField(source='bus.route.route_number', read_only=True, default=None)
    route = serializers.PrimaryKeyRelatedField(source='bus.route', read_only=True)

    class Meta:
        model = BusReport
        fields = [
            'id', 'user', 'username', 'bus', 'bus_plate', 'route', 'route_name', 'route_number',
            'cleanliness', 'crowding', 'driving', 'comment', 'created_at', 'reviewed',
        ]
        read_only_fields = ['user', 'created_at', 'reviewed']

    def validate(self, attrs):
        # A report with nothing flagged carries no signal.
        if not any(attrs.get(dimension) for dimension in BusReport.DIMENSIONS):
            raise serializers.ValidationError(
                'Choose at least one of cleanliness, crowding or driving to report.'
            )

        # Only riders actually aboard may report, evidenced by their tap-in.
        bus = attrs.get('bus')
        user = self.context['request'].user
        cutoff = timezone.now() - timedelta(minutes=BusReport.BOARDING_WINDOW_MINUTES)
        if not Ridership.objects.filter(user=user, bus=bus, created_at__gte=cutoff).exists():
            raise serializers.ValidationError(
                "You can only report a bus you are on. Open the bus and tap \"I'm on this bus\" first."
            )

        return attrs


class TrafficReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TrafficReport
        fields = ['id', 'user', 'username', 'location', 'severity', 'created_at', 'reviewed']
        read_only_fields = ['user', 'created_at']