from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from apps.tenants.models import Tenant, TenantUser
from apps.users.models import User
from utils.resend import EmailSender
import string
import random


@login_required(login_url='/auth/login/')
def tenant_list_view(request):
    tenants = Tenant.objects.all().order_by('-created_at')

    if request.method == 'POST':
        name = request.POST.get('name')
        business_type = request.POST.get('business_type', Tenant.BusinessType.GENERAL)
        admin_email = request.POST.get('admin_email')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')

        if name and admin_email:
            user, created = User.objects.get_or_create(email=admin_email)
            password = None
            if created:
                password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
                user.set_password(password)
                user.save()
                
                if hasattr(user, 'profile'):
                    user.profile.first_name = first_name
                    user.profile.last_name = last_name
                    user.profile.save()
                    
                messages.info(request, f"An email has been sent to {admin_email} with their temporary password: {password}")
            else:
                messages.info(request, f"User {admin_email} already exists and will be assigned as admin.")

            tenant = Tenant.objects.create(name=name, business_type=business_type)
            TenantUser.objects.create(tenant=tenant, user=user, role=TenantUser.Role.ADMIN)
            
            # Send emails if new user
            if created and password:
                try:
                    user_name = admin_email.split('@')[0]
                    
                    # Send welcome email
                    EmailSender.send_welcome(
                        to=admin_email,
                        name=user_name
                    )
                    
                    # Send login credentials email
                    EmailSender.send_notification(
                        to=admin_email,
                        name=first_name if first_name else user_name,
                        title=f"Your Quantum Stack Admin Account",
                        message=f"Welcome to {name}! Your admin account has been created.<br><br>"
                                f"<strong>Login Details:</strong><br>"
                                f"Email: {admin_email}<br>"
                                f"Temporary Password: <code>{password}</code><br><br>"
                                f"Please log in and change your password immediately for security.",
                        cta_text="Login to Admin Panel",
                        cta_link="https://qstack-inventory.com/admin/login"  # Update with your admin URL
                    )
                except Exception as email_error:
                    print(f"Warning: Failed to send emails to {admin_email}: {str(email_error)}")
            
            messages.success(request, f"Tenant '{name}' registered successfully!")
        return redirect('tenant_list')

    return render(request, 'tenants/list.html', {
        'tenants': tenants,
        'business_types': Tenant.BusinessType.choices
    })


@login_required(login_url='/auth/login/')
def tenant_detail_view(request, pk):
    tenant = get_object_or_404(Tenant, pk=pk)
    tenant_users = tenant.users.all().select_related('user')
    
    # Get owner user
    owner_user = tenant.principal_user
    
    return render(request, 'tenants/details.html', {
        'tenant': tenant,
        'tenant_users': tenant_users,
        'owner_user': owner_user
    })


@login_required(login_url='/auth/login/')
def tenant_approve_view(request, pk):
    if request.method == 'POST':
        tenant = get_object_or_404(Tenant, pk=pk)
        
        # Activate owner user
        user = tenant.principal_user
        if user:
            if not user.is_active:
                user.is_active = True
                user.save()
                messages.success(request, f"User account '{user.email}' activated successfully!")
            else:
                messages.info(request, f"User account '{user.email}' is already active.")
        else:
            messages.warning(request, "No owner user found to activate.")
            
        tenant.is_active = True
        tenant.save()
        messages.success(request, f"Tenant '{tenant.name}' registration approved and store activated successfully!")
        
    return redirect('tenant_detail', pk=pk)


@login_required(login_url='/auth/login/')
def tenant_toggle_status_view(request, pk):
    if request.method == 'POST':
        tenant = get_object_or_404(Tenant, pk=pk)
        tenant.is_active = not tenant.is_active
        tenant.save()
        
        status_str = "activated" if tenant.is_active else "suspended"
        messages.success(request, f"Tenant '{tenant.name}' has been {status_str} successfully.")
        
    return redirect('tenant_detail', pk=pk)
