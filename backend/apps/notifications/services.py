# services/notification_service.py
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model
import logging
from typing import List, Dict, Any, Optional
from .models import Notification, NotificationChannel, UserNotificationPreference
from utils.resend import EmailSender

logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationService:
    """
    Comprehensive notification service supporting in-app and email channels.
    """
    
    @staticmethod
    def send_notification(
        user: User,
        title: str,
        message: str,
        channels: List[str] = None,
        html_message: str = None,
        category: str = None,
        action_url: str = None,
        template_name: str = None,
    ) -> Optional[Notification]:
        """
        Send a notification to a single user.
        
        Args:
            user: Target user
            title: Notification title
            message: Notification message
            channels: List of channels (default: [IN_APP])
            html_message: HTML version of message
            category: Category for filtering
            action_url: URL for CTA button
            template_name: Template name for lookup
            
        Returns:
            Notification object or None
        """
        if channels is None:
            channels = [NotificationChannel.IN_APP]

        # Get or create user preferences
        preferences, _ = UserNotificationPreference.objects.get_or_create(user=user)

        # Filter channels based on preferences
        enabled_channels = [
            channel for channel in channels 
            if getattr(preferences, f"{channel}_enabled", True)
        ]

        if not enabled_channels:
            logger.warning(f"No enabled channels for {user.email}")
            return None

        # Create in-app notification
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            html_message=html_message or message,
            channels=",".join(enabled_channels),
            category=category,
            action_url=action_url,
        )

        # Send via enabled channels
        try:
            if NotificationChannel.EMAIL in enabled_channels:
                NotificationService._send_email_notification(user, title, message, html_message or message)
        except Exception as e:
            logger.error(f"Failed to send email notification to {user.email}: {e}")
            notification.is_sent = False
            notification.save()

        notification.is_sent = True
        notification.save()
        
        logger.info(f"Notification sent to {user.email}: {title}")
        return notification

    @staticmethod
    def send_bulk_notification(
        users: List[User],
        title: str,
        message: str,
        **kwargs,
    ) -> Dict[str, int]:
        """
        Send notifications to multiple users.
        
        Returns: {sent: count, failed: count}
        """
        sent = 0
        failed = 0
        
        for user in users:
            try:
                NotificationService.send_notification(user, title, message, **kwargs)
                sent += 1
            except Exception as e:
                logger.error(f"Failed to send notification to {user.email}: {e}")
                failed += 1
        
        return {'sent': sent, 'failed': failed}

    @staticmethod
    def send_notification_to_user_by_email(
        email: str,
        title: str,
        message: str,
        **kwargs,
    ) -> Optional[Notification]:
        """Send notification by user email"""
        try:
            user = User.objects.get(email=email)
            return NotificationService.send_notification(user, title, message, **kwargs)
        except User.DoesNotExist:
            logger.warning(f"User with email {email} not found")
            return None

    @staticmethod
    def send_notification_to_tenant_users(
        tenant,
        title: str,
        message: str,
        **kwargs,
    ) -> Dict[str, int]:
        """Send notification to all users in a tenant"""
        from apps.tenants.models import TenantUser
        
        users = User.objects.filter(
            tenant_roles__tenant=tenant
        ).distinct()
        
        return NotificationService.send_bulk_notification(users, title, message, **kwargs)

    @staticmethod
    def send_activity_notification(
        user: User,
        activity_type: str,
        activity_description: str,
        **kwargs,
    ) -> Optional[Notification]:
        """Send activity-based notification"""
        title_map = {
            'product_added': '📦 New Product Added',
            'product_updated': '✏️ Product Updated',
            'product_deleted': '🗑️ Product Removed',
            'order_created': '📋 New Order',
            'order_completed': '✅ Order Completed',
            'stock_low': '⚠️ Low Stock Alert',
            'user_added': '👤 New Team Member',
            'user_removed': '❌ Team Member Removed',
        }
        
        title = title_map.get(activity_type, 'Notification')
        
        return NotificationService.send_notification(
            user=user,
            title=title,
            message=activity_description,
            category=activity_type,
            **kwargs,
        )

    @staticmethod
    def _send_email_notification(user: User, title: str, message: str, html_message: str = None):
        """Send email notification using Resend"""
        try:
            user_name = getattr(user, 'first_name', None) or user.email.split('@')[0]
            
            EmailSender.send_notification(
                to=user.email,
                name=user_name,
                title=title,
                message=message,
                cta_text="View in Dashboard",
                cta_link="https://qstack-inventory.com/dashboard"  # Update with your URL
            )
        except Exception as e:
            logger.error(f"Failed to send email via Resend: {e}")
            raise

    @staticmethod
    def get_user_notifications(
        user: User,
        category: str = None,
        is_read: bool = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple:
        """
        Get notifications for a user with filtering.
        
        Returns: (notifications, total_count)
        """
        queryset = Notification.objects.filter(user=user).order_by('-created_at')
        
        if category:
            queryset = queryset.filter(category=category)
        
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read)
        
        total_count = queryset.count()
        notifications = queryset[offset:offset + limit]
        
        return notifications, total_count

    @staticmethod
    def get_unread_count(user: User) -> int:
        """Get unread notification count for user"""
        return Notification.objects.filter(user=user, is_read=False).count()

    @staticmethod
    def mark_all_as_read(user: User) -> int:
        """Mark all user notifications as read"""
        count = Notification.objects.filter(user=user, is_read=False).update(is_read=True)
        return count

    @staticmethod
    def delete_old_notifications(days: int = 30) -> int:
        """Delete notifications older than specified days"""
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        count = Notification.objects.filter(created_at__lt=cutoff_date).delete()[0]
        logger.info(f"Deleted {count} old notifications")
        return count
