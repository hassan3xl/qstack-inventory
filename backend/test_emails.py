#!/usr/bin/env python
"""
Test script for email sending functionality
Run with: python test_emails.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.dev')
django.setup()

from utils.resend import EmailSender, EmailType

# Test email - change this to your email
TEST_EMAIL = "saiduhassanhussain@gmail.com"
TEST_NAME = "Hasan"


def test_password_reset():
    """Test password reset email"""
    print("\n📧 Testing Password Reset Email...")
    try:
        EmailSender.send_password_reset(
            to=TEST_EMAIL,
            name=TEST_NAME,
            reset_link="https://qstack.com/reset?token=abc123xyz",
            expiry_hours=24
        )
        print("✓ Password reset email sent successfully!")
    except Exception as e:
        print(f"✗ Error sending password reset email: {e}")


def test_email_verification():
    """Test email verification"""
    print("\n📧 Testing Email Verification...")
    try:
        EmailSender.send_email_verification(
            to=TEST_EMAIL,
            name=TEST_NAME,
            verification_link="https://qstack.com/verify?token=verify123"
        )
        print("✓ Email verification sent successfully!")
    except Exception as e:
        print(f"✗ Error sending email verification: {e}")


def test_account_created():
    """Test account created confirmation"""
    print("\n📧 Testing Account Created Confirmation...")
    try:
        EmailSender.send_account_created(
            to=TEST_EMAIL,
            name=TEST_NAME,
            email=TEST_EMAIL,
            login_link="https://qstack.com/login"
        )
        print("✓ Account created email sent successfully!")
    except Exception as e:
        print(f"✗ Error sending account created email: {e}")


def test_password_changed():
    """Test password changed confirmation"""
    print("\n📧 Testing Password Changed Confirmation...")
    try:
        EmailSender.send_password_changed(
            to=TEST_EMAIL,
            name=TEST_NAME
        )
        print("✓ Password changed email sent successfully!")
    except Exception as e:
        print(f"✗ Error sending password changed email: {e}")


def test_welcome():
    """Test welcome email"""
    print("\n📧 Testing Welcome Email...")
    try:
        EmailSender.send_welcome(
            to=TEST_EMAIL,
            name=TEST_NAME
        )
        print("✓ Welcome email sent successfully!")
    except Exception as e:
        print(f"✗ Error sending welcome email: {e}")


def test_custom_notification():
    """Test custom notification"""
    print("\n📧 Testing Custom Notification...")
    try:
        EmailSender.send_notification(
            to=TEST_EMAIL,
            name=TEST_NAME,
            title="Low Stock Alert",
            message="You have low stock for product 'Widget A'. Current stock: 5 units.",
            cta_text="View Inventory",
            cta_link="https://qstack.com/inventory"
        )
        print("✓ Custom notification sent successfully!")
    except Exception as e:
        print(f"✗ Error sending custom notification: {e}")


def test_multiple_emails():
    """Test sending to multiple recipients"""
    print("\n📧 Testing Multiple Recipients...")
    try:
        EmailSender.send(
            to=[TEST_EMAIL, "another@example.com"],
            subject="Bulk Email Test",
            html="<p>This is a test email sent to multiple recipients.</p>",
            email_type=EmailType.CUSTOM
        )
        print("✓ Bulk email sent successfully!")
    except Exception as e:
        print(f"✗ Error sending bulk email: {e}")


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Email Sending Test Suite")
    print("=" * 50)
    print(f"\nTesting with email: {TEST_EMAIL}")
    
    # Run all tests
    test_password_reset()
    test_email_verification()
    test_account_created()
    test_password_changed()
    test_welcome()
    test_custom_notification()
    test_multiple_emails()
    
    print("\n" + "=" * 50)
    print("✓ All tests completed!")
    print("=" * 50)
