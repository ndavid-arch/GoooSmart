from rest_framework import serializers
from .models import Stop, Route, RouteStop


class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = ['id', 'stop_name', 'latitude', 'longitude']


class RouteStopSerializer(serializers.ModelSerializer):
    stop_name = serializers.CharField(source='stop.stop_name', read_only=True)
    latitude = serializers.DecimalField(source='stop.latitude', max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(source='stop.longitude', max_digits=9, decimal_places=6, read_only=True)

    class Meta:
        model = RouteStop
        fields = ['id', 'route', 'stop', 'stop_order', 'stop_name', 'latitude', 'longitude','scheduled_leg_minutes',]

class RouteSerializer(serializers.ModelSerializer):
    # nested, ordered list of stops shown when viewing a route
    route_stops = RouteStopSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'route_name', 'start_point', 'end_point', 'route_stops']