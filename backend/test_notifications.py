#!/usr/bin/env python
"""
Test script for notification system
Run with: python test_notifications.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.dev')
django.setup()

from django.contrib.auth import get_user_model
from apps.notifications.services import NotificationService
from apps.notifications.triggers import NotificationTriggers
from apps.notifications.models import NotificationChannel
from apps.tenants.models import Tenant, TenantUser

User = get_user_model()

# Test email
TEST_EMAIL = "saiduhassanhussain@gmail.com"


def test_single_notification():
    """Test sending a single notification"""
    print("\n" + "="*60)
    print("📧 Test 1: Single Notification")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        
        notification = NotificationService.send_notification(
            user=user,
            title="🎉 Welcome to Qstack!",
            message="Your account has been set up successfully. "
                   "Start managing your inventory now!",
            category="welcome",
            action_url="https://inventory.qstack.com.ng/dashboard",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        )
        
        print(f"✅ Single notification sent!")
        print(f"   ID: {notification.id}")
        print(f"   Title: {notification.title}")
        print(f"   User: {notification.user.email}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_activity_notification():
    """Test activity-based notification"""
    print("\n" + "="*60)
    print("📧 Test 2: Activity Notification")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        
        notification = NotificationService.send_activity_notification(
            user=user,
            activity_type='product_added',
            activity_description="New iPhone 15 Pro (256GB) has been added to your inventory.",
            channels=[NotificationChannel.IN_APP]
        )
        
        print(f"✅ Activity notification sent!")
        print(f"   Activity: product_added")
        print(f"   Title: {notification.title}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_unread_count():
    """Test getting unread count"""
    print("\n" + "="*60)
    print("📊 Test 3: Unread Count")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        unread_count = NotificationService.get_unread_count(user)
        
        print(f"✅ Unread count retrieved!")
        print(f"   Unread notifications: {unread_count}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_mark_all_as_read():
    """Test marking all as read"""
    print("\n" + "="*60)
    print("✏️  Test 4: Mark All as Read")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        count = NotificationService.mark_all_as_read(user)
        
        print(f"✅ Marked all as read!")
        print(f"   Notifications updated: {count}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_notification_triggers():
    """Test notification triggers"""
    print("\n" + "="*60)
    print("🎯 Test 5: Notification Triggers")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        
        # Test password changed notification
        result = NotificationTriggers.on_password_changed(user)
        print(f"✅ Password changed notification sent")
        
        # Test profile updated notification
        result = NotificationTriggers.on_profile_updated(user)
        print(f"✅ Profile updated notification sent")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_get_notifications():
    """Test retrieving notifications"""
    print("\n" + "="*60)
    print("📋 Test 6: Get Notifications")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        notifications, total = NotificationService.get_user_notifications(
            user=user,
            limit=5,
            offset=0
        )
        
        print(f"✅ Notifications retrieved!")
        print(f"   Total: {total}")
        print(f"   Fetched: {len(notifications)}")
        
        for notif in notifications[:3]:
            print(f"   - {notif.title} ({notif.category})")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_bulk_notifications():
    """Test bulk notifications"""
    print("\n" + "="*60)
    print("📢 Test 7: Bulk Notifications")
    print("="*60)
    
    try:
        # Get first 3 users
        users = User.objects.all()[:3]
        
        if not users:
            print("⚠️  No users found to test bulk notifications")
            return False
        
        result = NotificationService.send_bulk_notification(
            users=list(users),
            title="🔔 System Update",
            message="We've updated our notification system with new features!",
            category="system_alert",
            channels=[NotificationChannel.IN_APP]
        )
        
        print(f"✅ Bulk notifications sent!")
        print(f"   Sent: {result['sent']}")
        print(f"   Failed: {result['failed']}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


def test_notification_categories():
    """Test different notification categories"""
    print("\n" + "="*60)
    print("🏷️  Test 8: Notification Categories")
    print("="*60)
    
    try:
        user = User.objects.get(email=TEST_EMAIL)
        
        categories = [
            ('stock_low', 'iPhone 15 stock is running low (2 units remaining)'),
            ('order_created', 'New order #ORD-2026-001 received (Total: ₦50,000)'),
            ('user_added', 'John Doe has been added to your team'),
        ]
        
        for category, message in categories:
            NotificationService.send_notification(
                user=user,
                title=f"Test: {category}",
                message=message,
                category=category,
                channels=[NotificationChannel.IN_APP]
            )
            print(f"✅ Sent: {category}")
        
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔔 NOTIFICATION SYSTEM TEST SUITE")
    print("="*60)
    print(f"\nTesting with user: {TEST_EMAIL}\n")
    
    results = []
    
    # Run all tests
    results.append(("Single Notification", test_single_notification()))
    results.append(("Activity Notification", test_activity_notification()))
    results.append(("Unread Count", test_unread_count()))
    results.append(("Mark All as Read", test_mark_all_as_read()))
    results.append(("Notification Triggers", test_notification_triggers()))
    results.append(("Get Notifications", test_get_notifications()))
    results.append(("Bulk Notifications", test_bulk_notifications()))
    results.append(("Notification Categories", test_notification_categories()))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print("\n" + "="*60)
    print(f"Results: {passed}/{total} PASSED")
    
    if passed == total:
        print("✅ ALL TESTS PASSED!")
    else:
        print(f"⚠️  {total - passed} test(s) failed")
    
    print("="*60)
