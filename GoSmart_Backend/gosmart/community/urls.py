from rest_framework.routers import DefaultRouter
from .views import BusReportViewSet, RatingViewSet, TrafficReportViewSet

router = DefaultRouter()
router.register('ratings', RatingViewSet, basename='rating')
router.register('bus-reports', BusReportViewSet, basename='busreport')
router.register('traffic-reports', TrafficReportViewSet, basename='trafficreport')

urlpatterns = router.urls