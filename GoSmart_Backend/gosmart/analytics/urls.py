from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    DelaySummaryView,
    EtaAlertViewSet,
    PushSubscribeView,
    PushUnsubscribeView,
    RidershipBoardView,
    RidershipSummaryView,
    VapidPublicKeyView,
)

router = DefaultRouter()
router.register('eta-alerts', EtaAlertViewSet, basename='etaalert')

urlpatterns = router.urls + [
    path('ridership/board/', RidershipBoardView.as_view(), name='ridership-board'),
    path('analytics/ridership-summary/', RidershipSummaryView.as_view(), name='ridership-summary'),
    path('analytics/delay-summary/', DelaySummaryView.as_view(), name='delay-summary'),
    path('push/subscribe/', PushSubscribeView.as_view(), name='push-subscribe'),
    path('push/unsubscribe/', PushUnsubscribeView.as_view(), name='push-unsubscribe'),
    path('push/vapid-public-key/', VapidPublicKeyView.as_view(), name='push-vapid-public-key'),
]