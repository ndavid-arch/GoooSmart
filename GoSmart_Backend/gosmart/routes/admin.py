from django.contrib import admin
from .models import Route, Stop, RouteStop


class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 1
    ordering = ('stop_order',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route_name', 'start_point', 'end_point')
    inlines = [RouteStopInline]


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('stop_name', 'latitude', 'longitude')
