from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, CustomerViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet, basename='customers')
router.register(r'', SaleViewSet, basename='sales')

urlpatterns = [
    path('', include(router.urls)),
]
