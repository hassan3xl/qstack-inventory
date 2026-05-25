from .models import Tenant
from django.contrib import admin


class TenantAdmin(admin.ModelAdmin):
    list_display = ["name", "schema_name", "is_active"]


admin.site.register(Tenant, TenantAdmin)
