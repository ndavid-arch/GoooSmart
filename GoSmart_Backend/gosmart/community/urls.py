from rest_framework.routers import DefaultRouter
from .views import RatingViewSet, TrafficReportViewSet

router = DefaultRouter()
router.register('ratings', RatingViewSet, basename='rating')
router.register('traffic-reports', TrafficReportViewSet, basename='trafficreport')

urlpatterns = router.urls