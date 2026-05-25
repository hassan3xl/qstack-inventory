from .models import Tenant
from django.contrib import admin


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active"]
