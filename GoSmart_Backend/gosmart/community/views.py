from datetime import timedelta

from django.db.models import Avg
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from analytics.models import Ridership
from .models import BusReport, Rating, TrafficReport
from .serializers import BusReportSerializer, RatingSerializer, TrafficReportSerializer
from common.permissions import IsOwnerOrAdminOrReadOnly, CanReportReadCreateAdminDelete


class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsOwnerOrAdminOrReadOnly]

    def get_queryset(self):
        qs = Rating.objects.all()
        bus_id = self.request.query_params.get('bus')
        if bus_id:
            qs = qs.filter(bus_id=bus_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """GET /api/ratings/summary/?bus=<id> -> average cleanliness/safety for that bus."""
        bus_id = request.query_params.get('bus')
        if not bus_id:
            return Response({'error': 'bus query parameter is required'}, status=400)
        qs = Rating.objects.filter(bus_id=bus_id)
        averages = qs.aggregate(avg_cleanliness=Avg('cleanliness'), avg_safety=Avg('safety'))
        return Response({
            'bus': bus_id,
            'total_ratings': qs.count(),
            'avg_cleanliness': round(averages['avg_cleanliness'] or 0, 2),
            'avg_safety': round(averages['avg_safety'] or 0, 2),
        })


class BusReportViewSet(viewsets.ModelViewSet):
    queryset = BusReport.objects.all()
    serializer_class = BusReportSerializer
    permission_classes = [CanReportReadCreateAdminDelete]

    def get_queryset(self):
        qs = BusReport.objects.select_related('bus', 'bus__route', 'user')
        bus_id = self.request.query_params.get('bus')
        if bus_id:
            qs = qs.filter(bus_id=bus_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='boardable')
    def boardable(self, request):
        """
        GET /api/bus-reports/boardable/ - buses this rider tapped into recently,
        i.e. the ones they are allowed to report on right now.
        """
        # Guests have no tap-ins, so there is nothing they may report on.
        if not request.user.is_authenticated:
            return Response({'window_minutes': BusReport.BOARDING_WINDOW_MINUTES, 'buses': []})

        cutoff = timezone.now() - timedelta(minutes=BusReport.BOARDING_WINDOW_MINUTES)
        taps = (
            Ridership.objects.filter(user=request.user, created_at__gte=cutoff)
            .select_related('bus', 'bus__route')
            .order_by('-created_at')
        )

        # MySQL has no DISTINCT ON, so keep the latest tap per bus in Python.
        seen = {}
        for tap in taps:
            seen.setdefault(tap.bus_id, tap)

        return Response({
            'window_minutes': BusReport.BOARDING_WINDOW_MINUTES,
            'buses': [
                {
                    'bus': tap.bus_id,
                    'plate_no': tap.bus.plate_no,
                    'route': tap.bus.route_id,
                    'route_name': tap.bus.route.route_name if tap.bus.route else None,
                    'route_number': tap.bus.route.route_number if tap.bus.route else None,
                    'boarded_at': tap.created_at,
                }
                for tap in seen.values()
            ],
        })


class TrafficReportViewSet(viewsets.ModelViewSet):
    queryset = TrafficReport.objects.all()
    serializer_class = TrafficReportSerializer
    permission_classes = [CanReportReadCreateAdminDelete]

    def get_queryset(self):
        qs = TrafficReport.objects.all()
        severity = self.request.query_params.get('severity')
        if severity:
            qs = qs.filter(severity=severity)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Only admin can flip the 'reviewed' flag
        if getattr(self.request.user, 'role', None) != 'admin':
            serializer.validated_data.pop('reviewed', None)
        serializer.save()