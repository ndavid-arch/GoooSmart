from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'license_no', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('GoSmart profile', {'fields': ('role', 'phone', 'license_no')}),
    )


admin.site.register(User, CustomUserAdmin)
