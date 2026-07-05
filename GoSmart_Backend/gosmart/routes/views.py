from rest_framework import viewsets
from .models import Stop, Route, RouteStop
from .serializers import StopSerializer, RouteSerializer, RouteStopSerializer
from common.permissions import IsAdminOrReadOnly


class StopViewSet(viewsets.ModelViewSet):
    queryset = Stop.objects.all()
    serializer_class = StopSerializer
    permission_classes = [IsAdminOrReadOnly]


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAdminOrReadOnly]


class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer
    permission_classes = [IsAdminOrReadOnly]