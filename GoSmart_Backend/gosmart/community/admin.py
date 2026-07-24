from django.contrib import admin
from .models import Rating, TrafficReport


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bus', 'cleanliness', 'safety', 'created_at')
    list_filter = ('cleanliness', 'safety')


@admin.register(TrafficReport)
class TrafficReportAdmin(admin.ModelAdmin):
    list_display = ('location', 'severity', 'reviewed', 'user', 'created_at')
    list_filter = ('severity', 'reviewed')
    actions = ['mark_reviewed']

    @admin.action(description='Mark selected reports as reviewed')
    def mark_reviewed(self, request, queryset):
        queryset.update(reviewed=True)
