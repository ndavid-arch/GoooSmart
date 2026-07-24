"""
Seed the database with the team's agreed-upon test accounts
and sample data, for API testing.

Usage:
    python manage.py seed_db
"""
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from routes.models import Route, Stop, RouteStop
from tracking.models import Bus
from community.models import Rating, TrafficReport


class Command(BaseCommand):
    help = "Seed the database with the team's test accounts and sample data."

    def handle(self, *args, **options):
        admin1, _ = User.objects.get_or_create(
            username='admin1', defaults={
                'email': 'admin1@gosmart.rw', 'role': 'admin',
                'is_staff': True, 'is_superuser': True,
            }
        )
        admin1.set_password('Admin@1234')
        admin1.save()

        eric, _ = User.objects.get_or_create(
            username='eric', defaults={
                'email': 'eric@gosmart.rw', 'role': 'driver',
                'phone': '0788123456', 'license_no': 'RAD-2291',
            }
        )
        eric.set_password('Driver@1234')
        eric.save()

        claude_h, _ = User.objects.get_or_create(
            username='claude_h', defaults={
                'email': 'claudeh@gosmart.rw', 'role': 'driver',
                'phone': '0722987654', 'license_no': 'RAD-7740',
            }
        )
        claude_h.set_password('Driver@1234')
        claude_h.save()

        aline, _ = User.objects.get_or_create(
            username='aline', defaults={
                'email': 'aline@gosmart.rw', 'role': 'passenger', 'phone': '0788111111',
            }
        )
        aline.set_password('Passenger@1234')
        aline.save()

        john, _ = User.objects.get_or_create(
            username='john', defaults={
                'email': 'john@gosmart.rw', 'role': 'passenger', 'phone': '0788222222',
            }
        )
        john.set_password('Passenger@1234')
        john.save()

        route1, _ = Route.objects.get_or_create(
            route_name='Nyabugogo–Kimironko',
            defaults={'start_point': 'Nyabugogo', 'end_point': 'Kimironko'},
        )
        route2, _ = Route.objects.get_or_create(
            route_name='Downtown–Remera',
            defaults={'start_point': 'Downtown', 'end_point': 'Remera'},
        )

        stop1, _ = Stop.objects.get_or_create(
            stop_name='Kimironko Market', defaults={'latitude': -1.945600, 'longitude': 30.125300}
        )
        stop2, _ = Stop.objects.get_or_create(
            stop_name='Remera Bus Park', defaults={'latitude': -1.957800, 'longitude': 30.118900}
        )

        RouteStop.objects.get_or_create(route=route1, stop=stop1, defaults={'stop_order': 1})
        RouteStop.objects.get_or_create(route=route1, stop=stop2, defaults={'stop_order': 2})

        bus1, _ = Bus.objects.get_or_create(
            plate_no='RAC-100A', defaults={
                'capacity': 30, 'route': route1, 'driver': eric,
                'current_lat': -1.945600, 'current_lng': 30.125300,
                'last_updated': timezone.now(),
            }
        )
        bus2, _ = Bus.objects.get_or_create(
            plate_no='RAC-205B', defaults={
                'capacity': 30, 'route': route2, 'driver': claude_h,
                'current_lat': -1.957800, 'current_lng': 30.118900,
                'last_updated': timezone.now(),
            }
        )

        Rating.objects.get_or_create(
            user=aline, bus=bus1, defaults={'cleanliness': 4, 'safety': 5, 'comment': 'Smooth ride.'}
        )
        Rating.objects.get_or_create(
            user=john, bus=bus2, defaults={'cleanliness': 3, 'safety': 4, 'comment': 'A bit crowded.'}
        )

        TrafficReport.objects.get_or_create(
            user=aline, location='Kimironko junction', defaults={'severity': 'heavy'}
        )
        TrafficReport.objects.get_or_create(
            user=john, location='Remera roundabout', defaults={'severity': 'moderate'}
        )

        self.stdout.write(self.style.SUCCESS(
            'Seed data created: 5 test users (admin1, eric, claude_h, aline, john), '
            '2 routes, 2 stops, 2 buses, 2 ratings, 2 traffic reports.'
        ))
