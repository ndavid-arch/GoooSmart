from rest_framework.routers import DefaultRouter
from .views import StopViewSet, RouteViewSet, RouteStopViewSet

router = DefaultRouter()
router.register('stops', StopViewSet, basename='stop')
router.register('routes', RouteViewSet, basename='route')
router.register('route-stops', RouteStopViewSet, basename='routestop')

urlpatterns = router.urls