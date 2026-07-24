from datetime import timedelta

from django.conf import settings
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdmin
from tracking.models import Bus
from .models import DelayLog, EtaAlert, PushSubscription, Ridership
from .serializers import EtaAlertSerializer, PushSubscriptionSerializer, RidershipSerializer


class RidershipBoardView(APIView):
    """POST /api/ridership/board/ {"bus": <id>} - passenger taps in when boarding a bus."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        bus_id = request.data.get('bus')
        if not bus_id:
            return Response({'error': 'bus is required'}, status=status.HTTP_400_BAD_REQUEST)
        bus = get_object_or_404(Bus, pk=bus_id)
        ridership = Ridership.objects.create(user=request.user, bus=bus, route=bus.route)
        return Response(RidershipSerializer(ridership).data, status=status.HTTP_201_CREATED)


class RidershipSummaryView(APIView):
    """GET /api/analytics/ridership-summary/?days=7&route=<id> - admin-only dashboard data."""
    permission_classes = [IsAdmin]

    def get(self, request):
        days = _parse_days(request)
        since = timezone.now() - timedelta(days=days)
        qs = Ridership.objects.filter(created_at__gte=since)
        route_id = request.query_params.get('route')
        if route_id:
            qs = qs.filter(route_id=route_id)

        daily = (
            qs.annotate(date=TruncDate('created_at'))
            .values('date', 'route_id', 'route__route_name')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        by_route = (
            qs.values('route_id', 'route__route_name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'days': days,
            'total_riders': qs.count(),
            'daily': [
                {
                    'date': row['date'],
                    'route': row['route_id'],
                    'route_name': row['route__route_name'],
                    'count': row['count'],
                }
                for row in daily
            ],
            'by_route': [
                {'route': row['route_id'], 'route_name': row['route__route_name'], 'count': row['count']}
                for row in by_route
            ],
        })


class DelaySummaryView(APIView):
    """GET /api/analytics/delay-summary/?days=7&route=<id> - admin-only dashboard data."""
    permission_classes = [IsAdmin]

    def get(self, request):
        days = _parse_days(request)
        since = timezone.now() - timedelta(days=days)
        qs = DelayLog.objects.filter(recorded_at__gte=since)
        route_id = request.query_params.get('route')
        if route_id:
            qs = qs.filter(route_id=route_id)

        daily = (
            qs.annotate(date=TruncDate('recorded_at'))
            .values('date', 'route_id', 'route__route_name')
            .annotate(avg_delay=Avg('delay_minutes'), events=Count('id'))
            .order_by('date')
        )
        by_route = (
            qs.values('route_id', 'route__route_name')
            .annotate(avg_delay=Avg('delay_minutes'), events=Count('id'))
            .order_by('-avg_delay')
        )
        overall_avg = qs.aggregate(avg=Avg('delay_minutes'))['avg']

        return Response({
            'days': days,
            'total_legs_recorded': qs.count(),
            'avg_delay_minutes': round(overall_avg, 2) if overall_avg is not None else None,
            'late_legs': qs.filter(delay_minutes__gt=0).count(),
            'daily': [
                {
                    'date': row['date'],
                    'route': row['route_id'],
                    'route_name': row['route__route_name'],
                    'avg_delay_minutes': round(row['avg_delay'], 2) if row['avg_delay'] is not None else None,
                    'events': row['events'],
                }
                for row in daily
            ],
            'by_route': [
                {
                    'route': row['route_id'],
                    'route_name': row['route__route_name'],
                    'avg_delay_minutes': round(row['avg_delay'], 2) if row['avg_delay'] is not None else None,
                    'events': row['events'],
                }
                for row in by_route
            ],
        })


def _parse_days(request):
    try:
        days = int(request.query_params.get('days', 7))
    except (TypeError, ValueError):
        days = 7
    return max(1, min(days, 90))


class EtaAlertViewSet(viewsets.ModelViewSet):
    """Passenger-owned one-shot alerts: notify me when this bus nears my stop, or runs late."""
    serializer_class = EtaAlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return EtaAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PushSubscribeView(APIView):
    """POST /api/push/subscribe/ - store a browser's Web Push subscription for this user."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PushSubscription.objects.update_or_create(
            endpoint=serializer.validated_data['endpoint'],
            defaults={
                'user': request.user,
                'p256dh': serializer.validated_data['p256dh'],
                'auth': serializer.validated_data['auth'],
            },
        )
        return Response(status=status.HTTP_201_CREATED)


class PushUnsubscribeView(APIView):
    """POST /api/push/unsubscribe/ {"endpoint": ...} - remove a subscription (e.g. on logout)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get('endpoint')
        PushSubscription.objects.filter(user=request.user, endpoint=endpoint).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VapidPublicKeyView(APIView):
    """GET /api/push/vapid-public-key/ - public key the frontend needs to create a subscription."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'publicKey': settings.VAPID_PUBLIC_KEY})