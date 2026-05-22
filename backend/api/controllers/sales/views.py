from rest_framework import viewsets
from apps.tenants.permissions.tenant_roles import HasTenantAccess, IsTenantCashier
from apps.sales.models import Sale, Customer
from .serializers import SaleSerializer, CustomerSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [HasTenantAccess, IsTenantCashier]

    def get_queryset(self):
        qs = Customer.objects.filter(tenant=self.request.tenant)
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=search) | Q(phone__icontains=search))
        return qs.order_by('name')

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer
    permission_classes = [HasTenantAccess, IsTenantCashier]

    def get_queryset(self):
        # TenantBaseModel manager automatically filters, but we ensure strict filtering here
        return Sale.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)
