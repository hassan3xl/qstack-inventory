from rest_framework import serializers
from apps.notifications.models import Notification, UserNotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user_email',
            'title',
            'message',
            'category',
            'action_url',
            'is_read',
            'is_sent',
            'created_at',
        ]
        read_only_fields = fields


class NotificationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single notification"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user_email',
            'title',
            'message',
            'html_message',
            'category',
            'action_url',
            'is_read',
            'is_sent',
            'channels',
            'created_at',
        ]
        read_only_fields = fields


class NotificationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating notification status"""
    
    class Meta:
        model = Notification
        fields = ['is_read']


class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user notification preferences"""
    
    class Meta:
        model = UserNotificationPreference
        fields = [
            'email_enabled',
            'push_enabled',
            'sms_enabled',
            'in_app_enabled',
            'preferences',
        ]


class NotificationStatsSerializer(serializers.Serializer):
    """Serializer for notification statistics"""
    total = serializers.IntegerField()
    unread = serializers.IntegerField()
    by_category = serializers.DictField()
    by_date = serializers.DictField()
