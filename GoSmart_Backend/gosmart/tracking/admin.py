from django.contrib import admin
from .models import Bus


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('plate_no', 'capacity', 'route', 'driver', 'current_lat', 'current_lng', 'last_updated')
    list_filter = ('route',)
    search_fields = ('plate_no',)
