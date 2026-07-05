from rest_framework import serializers
from .models import Rating, TrafficReport


class RatingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    bus_plate = serializers.CharField(source='bus.plate_no', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'username', 'bus', 'bus_plate', 'cleanliness', 'safety', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']


class TrafficReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TrafficReport
        fields = ['id', 'user', 'username', 'location', 'severity', 'created_at', 'reviewed']
        read_only_fields = ['user', 'created_at']