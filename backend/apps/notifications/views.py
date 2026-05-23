from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.notifications.models import Notification, UserNotificationPreference
from apps.notifications.serializers import (
    NotificationSerializer,
    NotificationDetailSerializer,
    NotificationUpdateSerializer,
    UserNotificationPreferenceSerializer,
    NotificationStatsSerializer,
)
from apps.notifications.services import NotificationService


class NotificationListAPIView(generics.ListAPIView):
    """
    List all notifications for the current user.
    GET /api/notifications/
    
    Query Parameters:
    - category: Filter by category
    - is_read: Filter by read status (true/false)
    - limit: Number of notifications to return (default: 50)
    - offset: Pagination offset (default: 0)
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Will handle manually

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user).order_by('-created_at')
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by read status if provided
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        
        total_count = queryset.count()
        notifications = queryset[offset:offset + limit]
        
        serializer = self.get_serializer(notifications, many=True)
        
        return Response({
            'count': total_count,
            'limit': limit,
            'offset': offset,
            'results': serializer.data,
        })


class NotificationDetailAPIView(APIView):
    """
    Retrieve or update a single notification.
    GET /api/notifications/{id}/
    PATCH /api/notifications/{id}/
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, user, notification_id):
        try:
            return Notification.objects.get(id=notification_id, user=user)
        except Notification.DoesNotExist:
            return None

    def get(self, request, notification_id):
        notification = self.get_object(request.user, notification_id)
        if not notification:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = NotificationDetailSerializer(notification)
        return Response(serializer.data)

    def patch(self, request, notification_id):
        notification = self.get_object(request.user, notification_id)
        if not notification:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = NotificationUpdateSerializer(notification, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(NotificationDetailSerializer(notification).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationMarkAsReadAPIView(APIView):
    """
    Mark a notification as read.
    POST /api/notifications/{id}/mark-as-read/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.mark_as_read()
            return Response(
                {"message": "Notification marked as read"},
                status=status.HTTP_200_OK
            )
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationMarkAllAsReadAPIView(APIView):
    """
    Mark all notifications as read for the current user.
    POST /api/notifications/mark-all-as-read/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            "message": f"{count} notifications marked as read",
            "count": count
        })


class NotificationStatsAPIView(APIView):
    """
    Get notification statistics for the current user.
    GET /api/notifications/stats/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Total and unread counts
        all_notifications = Notification.objects.filter(user=user)
        total = all_notifications.count()
        unread = all_notifications.filter(is_read=False).count()
        
        # By category
        by_category = dict(
            all_notifications
            .values('category')
            .exclude(category__isnull=True)
            .annotate(count=Count('id'))
            .values_list('category', 'count')
        )
        
        # By date (last 7 days)
        by_date = {}
        for i in range(7):
            date = (timezone.now() - timedelta(days=i)).date()
            count = all_notifications.filter(created_at__date=date).count()
            by_date[str(date)] = count
        
        data = {
            'total': total,
            'unread': unread,
            'by_category': by_category,
            'by_date': by_date,
        }
        
        serializer = NotificationStatsSerializer(data)
        return Response(serializer.data)


class NotificationPreferencesAPIView(APIView):
    """
    Get or update user notification preferences.
    GET /api/notifications/preferences/
    PUT /api/notifications/preferences/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        preferences, _ = UserNotificationPreference.objects.get_or_create(user=request.user)
        serializer = UserNotificationPreferenceSerializer(preferences)
        return Response(serializer.data)

    def put(self, request):
        preferences, _ = UserNotificationPreference.objects.get_or_create(user=request.user)
        serializer = UserNotificationPreferenceSerializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationDeleteAPIView(APIView):
    """
    Delete a notification.
    DELETE /api/notifications/{id}/
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.delete()
            return Response(
                {"message": "Notification deleted"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationClearAllAPIView(APIView):
    """
    Clear all notifications for the current user.
    DELETE /api/notifications/clear-all/
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        count = Notification.objects.filter(user=request.user).delete()[0]
        return Response({
            "message": f"Deleted {count} notifications",
            "count": count
        })
