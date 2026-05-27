#!/usr/bin/env python
"""
Test script for integrated email sending in tenant and user creation
Run with: python test_integration_emails.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.dev')
django.setup()

from django.contrib.auth import get_user_model
from apps.tenants.models import Tenant, TenantUser
from utils.resend import EmailSender
import random
import string

User = get_user_model()

TEST_EMAIL = "saiduhassanhussain@gmail.com"


def generate_password(length=10):
    """Generate a random password"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def test_tenant_creation_emails():
    """Test emails sent when creating a tenant"""
    print("\n" + "="*60)
    print("📧 Testing Tenant Creation Emails")
    print("="*60)
    
    try:
        # Simulate tenant creation with email sending
        admin_email = TEST_EMAIL
        tenant_name = "Test Store"
        password = generate_password()
        
        print(f"\n✓ Simulating tenant creation:")
        print(f"  Tenant: {tenant_name}")
        print(f"  Email: {admin_email}")
        print(f"  Password: {password}")
        
        user_name = admin_email.split('@')[0]
        
        # Send welcome email
        print(f"\n  Sending welcome email...")
        EmailSender.send_welcome(
            to=admin_email,
            name=user_name
        )
        print(f"  ✓ Welcome email sent!")
        
        # Send login credentials email
        print(f"\n  Sending login credentials email...")
        EmailSender.send_notification(
            to=admin_email,
            name=user_name,
            title="Your Qstack Inventory Account Setup",
            message=f"Welcome to {tenant_name}! Your account has been created.<br><br>"
                    f"<strong>Login Details:</strong><br>"
                    f"Email: {admin_email}<br>"
                    f"Temporary Password: <code>{password}</code><br><br>"
                    f"Please log in and change your password immediately for security.",
            cta_text="Login to Your Account",
            cta_link="https://inventory.qstack.com.ng/login"
        )
        print(f"  ✓ Login credentials email sent!")
        
        print("\n✅ Tenant creation emails test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Tenant creation emails test FAILED: {e}")
        return False


def test_staff_creation_emails():
    """Test emails sent when adding staff"""
    print("\n" + "="*60)
    print("📧 Testing Staff Creation Emails")
    print("="*60)
    
    try:
        email = TEST_EMAIL
        first_name = "John"
        last_name = "Doe"
        store_role = "MANAGER"
        store_name = "My Store"
        password = generate_password()
        
        print(f"\n✓ Simulating staff creation:")
        print(f"  Name: {first_name} {last_name}")
        print(f"  Email: {email}")
        print(f"  Role: {store_role}")
        print(f"  Store: {store_name}")
        print(f"  Password: {password}")
        
        user_display_name = f"{first_name} {last_name}".strip()
        
        # Send staff welcome email
        print(f"\n  Sending staff welcome email...")
        EmailSender.send_notification(
            to=email,
            name=user_display_name,
            title=f"Welcome to {store_name}",
            message=f"You have been added to {store_name} as a {store_role}.<br><br>"
                    f"<strong>Login Details:</strong><br>"
                    f"Email: {email}<br>"
                    f"Temporary Password: <code>{password}</code><br><br>"
                    f"Please log in and change your password immediately for security.",
            cta_text="Login Now",
            cta_link="https://inventory.qstack.com.ng/login"
        )
        print(f"  ✓ Staff welcome email sent!")
        
        print("\n✅ Staff creation emails test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Staff creation emails test FAILED: {e}")
        return False


def test_admin_panel_tenant_creation():
    """Test emails in admin panel tenant creation"""
    print("\n" + "="*60)
    print("📧 Testing Admin Panel Tenant Creation Emails")
    print("="*60)
    
    try:
        admin_email = TEST_EMAIL
        tenant_name = "Admin Panel Store"
        password = generate_password()
        
        print(f"\n✓ Simulating admin panel tenant creation:")
        print(f"  Tenant: {tenant_name}")
        print(f"  Email: {admin_email}")
        print(f"  Password: {password}")
        
        user_name = admin_email.split('@')[0]
        
        # Send welcome email
        print(f"\n  Sending welcome email...")
        EmailSender.send_welcome(
            to=admin_email,
            name=user_name
        )
        print(f"  ✓ Welcome email sent!")
        
        # Send admin account email
        print(f"\n  Sending admin account email...")
        EmailSender.send_notification(
            to=admin_email,
            name=user_name,
            title="Your Qstack Inventory Admin Account",
            message=f"Welcome to {tenant_name}! Your admin account has been created.<br><br>"
                    f"<strong>Login Details:</strong><br>"
                    f"Email: {admin_email}<br>"
                    f"Temporary Password: <code>{password}</code><br><br>"
                    f"Please log in and change your password immediately for security.",
            cta_text="Login to Admin Panel",
            cta_link="https://inventory.qstack.com.ng/admin/login"
        )
        print(f"  ✓ Admin account email sent!")
        
        print("\n✅ Admin panel tenant creation emails test PASSED")
        return True
        
    except Exception as e:
        print(f"\n❌ Admin panel tenant creation emails test FAILED: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Integration Email Tests")
    print("="*60)
    print(f"\nTesting with email: {TEST_EMAIL}")
    
    results = []
    
    # Run all tests
    results.append(("Tenant Creation", test_tenant_creation_emails()))
    results.append(("Staff Creation", test_staff_creation_emails()))
    results.append(("Admin Panel", test_admin_panel_tenant_creation()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    print("\n" + "="*60)
    if all_passed:
        print("✅ All tests PASSED!")
    else:
        print("❌ Some tests FAILED")
    print("="*60)
