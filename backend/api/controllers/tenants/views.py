from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.tenants.models import Tenant, TenantUser
from apps.tenants.serializers import TenantSerializer, TenantDashboardSerializer
from apps.tenants.permissions.tenant_roles import HasTenantAccess, IsTenantAdmin, IsTenantOwner
from django.contrib.auth import get_user_model
from utils.resend import EmailSender
import string
import random

User = get_user_model()


class TenantRegisterAPIView(APIView):
    """
    Self-service tenant registration.
    POST /api/tenants/register/
    {
        "business_name": "My Store",
        "business_type": "grocery",
        "admin_email": "owner@example.com"
    }
    Creates the User (role=TENANT, is_active=False) and Tenant, then links them as OWNER.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        business_name = request.data.get('business_name')
        business_type = request.data.get('business_type', Tenant.BusinessType.GENERAL)
        admin_email = request.data.get('admin_email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not business_name or not admin_email:
            return Response(
                {"error": "business_name and admin_email are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.db import transaction
        try:
            with transaction.atomic():
                # 1. Create or get User — new registrations are business owners (TENANT role), set inactive
                user, created = User.objects.get_or_create(
                    email=admin_email,
                    defaults={'role': User.RoleChoices.TENANT, 'is_active': False}
                )
                if created:
                    password = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
                    user.set_password(password)
                    user.save()
                    
                    if hasattr(user, 'profile'):
                        user.profile.first_name = first_name
                        user.profile.last_name = last_name
                        user.profile.save()
                else:
                    if TenantUser.objects.filter(user=user).exists():
                        return Response(
                            {"error": f"User {admin_email} is already associated with a tenant"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # 2. Create Tenant
                tenant = Tenant.objects.create(name=business_name, business_type=business_type)

                # 3. Link owner — the registering user becomes the OWNER
                TenantUser.objects.create(tenant=tenant, user=user, role=TenantUser.Role.OWNER)

                # 4. Send welcome and login credentials emails
                try:
                    user_name = getattr(user.profile, 'first_name', None) or admin_email.split('@')[0]
                    
                    # Send welcome email
                    EmailSender.send_welcome(
                        to=admin_email,
                        name=user_name
                    )
                    
                    # Send login credentials email
                    EmailSender.send_notification(
                        to=admin_email,
                        name=user_name,
                        title="Your Qstack Inventory Account Setup",
                        message=f"Welcome to {tenant.name}! Your account has been created.<br><br>"
                                f"<strong>Login Details:</strong><br>"
                                f"Email: {admin_email}<br>"
                                f"Temporary Password: <code>{password}</code><br><br>"
                                f"Please log in and change your password immediately for security.",
                        cta_text="Login to Your Account",
                        cta_link="https://qstack-inventory.com/login"  # Update with your frontend URL
                    )
                except Exception as email_error:
                    print(f"Warning: Failed to send emails to {admin_email}: {str(email_error)}")
                    # Continue even if email fails

                return Response({
                    "message": "Registration received successfully. Your account is currently inactive. We will configure your application instance and send setup instructions to your email.",
                    "business_name": tenant.name,
                    "admin_email": admin_email
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Registration failed: {str(e)}"}, status=500)


class TenantListCreateAPIView(generics.ListCreateAPIView):
    """
    Platform-level list of all tenants (admin use).
    GET  /api/tenants/
    POST /api/tenants/   — creates a tenant and assigns the current user as OWNER
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        tenant = serializer.save()
        TenantUser.objects.create(tenant=tenant, user=self.request.user, role=TenantUser.Role.OWNER)


class TenantDetailAPIView(APIView):
    """
    Retrieve or update the current tenant's details.
    GET   /api/tenants/me/
    PATCH /api/tenants/me/
    """
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get(self, request):
        tenant = request.tenant
        serializer = TenantSerializer(tenant)
        return Response(serializer.data)

    def patch(self, request):
        tenant = request.tenant
        serializer = TenantSerializer(tenant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TenantDashboardAPIView(APIView):
    """
    Summary stats for the current tenant's dashboard.
    GET /api/tenants/dashboard/
    """
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get(self, request):
        tenant = request.tenant
        data = {
            "business_name": tenant.name,
            "business_type": tenant.get_business_type_display(),
            "total_products": 0,  # linked later
            "total_staff": tenant.users.count(),
        }
        serializer = TenantDashboardSerializer(data)
        return Response(serializer.data)


class TenantUserListAPIView(generics.ListAPIView):
    """
    List all users (staff) in the current tenant.
    GET /api/tenants/users/
    """
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated, HasTenantAccess]

    def get_queryset(self):
        tenant = getattr(self.request, 'tenant', None)
        if not tenant:
            return TenantUser.objects.none()
        return TenantUser.objects.filter(tenant=tenant).select_related('user')
