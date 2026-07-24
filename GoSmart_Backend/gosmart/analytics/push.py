"""Thin wrapper around pywebpush so the rest of the app never touches VAPID details directly."""
import json
import logging

from django.conf import settings
from pywebpush import webpush, WebPushException

logger = logging.getLogger(__name__)


def send_push_to_user(user, payload):
    """payload: dict with at least {'title', 'body'} - sent to every device the user subscribed from."""
    for subscription in user.push_subscriptions.all():
        subscription_info = {
            'endpoint': subscription.endpoint,
            'keys': {'p256dh': subscription.p256dh, 'auth': subscription.auth},
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={'sub': f'mailto:{settings.VAPID_ADMIN_EMAIL}'},
            )
        except WebPushException as exc:
            status = getattr(exc.response, 'status_code', None)
            if status in (404, 410):
                subscription.delete()
            else:
                logger.warning('Push failed for %s: %s', user.username, exc)