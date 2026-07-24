from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from analytics.services import record_leg_arrival, check_eta_alerts

from .models import Bus
from .serializers import BusSerializer, GPSUpdateSerializer
from common.permissions import IsAdminOrReadOnly
from .permissions import IsAssignedDriver  # type: ignore
from .utils import estimate_eta_minutes
from routes.models import Stop


class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = Bus.objects.all()
        route_id = self.request.query_params.get('route')
        if route_id:
            qs = qs.filter(route_id=route_id)
        return qs


class GPSUpdateView(APIView):
    """PATCH /api/buses/<id>/update-location/ — driver pushes their bus's live GPS position."""
    permission_classes = [permissions.IsAuthenticated, IsAssignedDriver]

    def patch(self, request, pk):
        bus = get_object_or_404(Bus, pk=pk)
        self.check_object_permissions(request, bus)

        serializer = GPSUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bus.current_lat = serializer.validated_data['latitude']
        bus.current_lng = serializer.validated_data['longitude']
        bus.last_updated = timezone.now()
        bus.save()
        record_leg_arrival(bus)
        check_eta_alerts(bus)

        return Response(BusSerializer(bus).data, status=status.HTTP_200_OK)


class BusETAView(APIView):
    """GET /api/buses/<id>/eta/?stop_id=X — estimated minutes for this bus to reach a stop."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        bus = get_object_or_404(Bus, pk=pk)
        stop_id = request.query_params.get('stop_id')
        if not stop_id:
            return Response({'error': 'stop_id query parameter is required'}, status=400)

        stop = get_object_or_404(Stop, pk=stop_id)

        if bus.current_lat is None or bus.current_lng is None:
            return Response({'error': 'This bus has no live GPS location yet'}, status=400)

        eta_minutes, distance_km = estimate_eta_minutes(
            bus.current_lat, bus.current_lng, stop.latitude, stop.longitude
        )
        return Response({
            'bus': bus.plate_no,
            'stop': stop.stop_name,
            'distance_km': distance_km,
            'eta_minutes': eta_minutes,
        })