from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import BusViewSet, GPSUpdateView, BusETAView

router = DefaultRouter()
router.register('buses', BusViewSet, basename='bus')

urlpatterns = router.urls + [
    path('buses/<int:pk>/update-location/', GPSUpdateView.as_view(), name='bus-update-location'),
    path('buses/<int:pk>/eta/', BusETAView.as_view(), name='bus-eta'),
]