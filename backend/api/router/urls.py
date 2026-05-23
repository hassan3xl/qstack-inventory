    
from django.urls import path, include
from api.controllers.dashboard.views import (
    BusinessProfileAPIView,
    StaffProfileAPIView,
    DashboardStatsAPIView,
    StaffListAPIView,
    StaffAddAPIView,
    StaffDetailAPIView,
    BusinessLogoAPIView
)
from rest_framework.routers import DefaultRouter
from ..controllers.products.views import CategoryViewSet
router = DefaultRouter()

router.register(r"", CategoryViewSet, basename="categories")

urlpatterns = [
    # Auth
    path('auth/', include('api.controllers.auth.urls')),
    path('notifications/', include('apps.notifications.urls')),


    # Tenant management & registration
    path('tenants/', include('api.controllers.tenants.urls')),

    # Business profile & staff (store-level)
    path('business/profile/', BusinessProfileAPIView.as_view(), name='business-profile'),
    path('business/logo/', BusinessLogoAPIView.as_view(), name='business-logo'),
    path('staff/profile/',    StaffProfileAPIView.as_view(),    name='staff-profile'),
    path('staff/list/',       StaffListAPIView.as_view(),       name='staff-list'),
    path('staff/add/',        StaffAddAPIView.as_view(),        name='staff-add'),
    path('staff/<uuid:user_id>/', StaffDetailAPIView.as_view(), name='staff-detail'),
    path('dashboard/stats/',  DashboardStatsAPIView.as_view(),  name='dashboard-stats'),

    # Inventory & Product APIs
    path('inventory/products/', include('api.controllers.products.urls')),
    path('inventory/categories/', include('api.controllers.products.urls')),

    # Sales & POS
    path('sales/', include('api.controllers.sales.urls')),

    # User profile
    path('user/profile/', include('api.controllers.users.urls')),
]