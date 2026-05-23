from django.urls import path
from apps.notifications import views

urlpatterns = [
    # List notifications
    path('', views.NotificationListAPIView.as_view(), name='notification-list'),
    
    # Notification stats
    path('stats/', views.NotificationStatsAPIView.as_view(), name='notification-stats'),
    
    # User preferences
    path('preferences/', views.NotificationPreferencesAPIView.as_view(), name='notification-preferences'),
    
    # Mark all as read
    path('mark-all-as-read/', views.NotificationMarkAllAsReadAPIView.as_view(), name='notification-mark-all-read'),
    
    # Clear all notifications
    path('clear-all/', views.NotificationClearAllAPIView.as_view(), name='notification-clear-all'),
    
    # Single notification operations
    path('<str:notification_id>/', views.NotificationDetailAPIView.as_view(), name='notification-detail'),
    path('<str:notification_id>/mark-as-read/', views.NotificationMarkAsReadAPIView.as_view(), name='notification-mark-read'),
    path('<str:notification_id>/delete/', views.NotificationDeleteAPIView.as_view(), name='notification-delete'),
]
