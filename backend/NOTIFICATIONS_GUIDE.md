# 🔔 Notification System Documentation

## Overview

A complete, production-ready notification system for Qstack Inventory that sends notifications via:

- ✅ In-App (database stored)
- ✅ Email (via Resend)

Users can manage preferences and view all notifications in real-time.

---

## API Endpoints

### 1. List Notifications

```
GET /api/notifications/
```

**Query Parameters:**

- `category` - Filter by category
- `is_read` - Filter by read status (true/false)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**

```json
{
  "count": 150,
  "limit": 50,
  "offset": 0,
  "results": [
    {
      "id": "uuid",
      "user_email": "user@example.com",
      "title": "New Order",
      "message": "You have a new order",
      "category": "order_created",
      "action_url": "https://example.com/orders/123",
      "is_read": false,
      "is_sent": true,
      "created_at": "2026-05-22T10:00:00Z"
    }
  ]
}
```

### 2. Get Single Notification

```
GET /api/notifications/{notification_id}/
```

**Response:**

```json
{
  "id": "uuid",
  "user_email": "user@example.com",
  "title": "New Order",
  "message": "You have a new order",
  "html_message": "<p>You have a new order</p>",
  "category": "order_created",
  "action_url": "https://example.com/orders/123",
  "is_read": false,
  "is_sent": true,
  "channels": "in_app,email",
  "created_at": "2026-05-22T10:00:00Z"
}
```

### 3. Mark as Read

```
POST /api/notifications/{notification_id}/mark-as-read/
```

**Response:**

```json
{
  "message": "Notification marked as read"
}
```

### 4. Mark All as Read

```
POST /api/notifications/mark-all-as-read/
```

**Response:**

```json
{
  "message": "45 notifications marked as read",
  "count": 45
}
```

### 5. Delete Notification

```
DELETE /api/notifications/{notification_id}/delete/
```

### 6. Clear All Notifications

```
DELETE /api/notifications/clear-all/
```

**Response:**

```json
{
  "message": "Deleted 150 notifications",
  "count": 150
}
```

### 7. Get Notification Stats

```
GET /api/notifications/stats/
```

**Response:**

```json
{
  "total": 150,
  "unread": 12,
  "by_category": {
    "order_created": 45,
    "product_added": 30,
    "stock_low": 25,
    "staff_added": 20,
    "other": 30
  },
  "by_date": {
    "2026-05-22": 15,
    "2026-05-21": 20,
    "2026-05-20": 18,
    "2026-05-19": 25,
    "2026-05-18": 30,
    "2026-05-17": 22,
    "2026-05-16": 25
  }
}
```

### 8. Get User Preferences

```
GET /api/notifications/preferences/
```

**Response:**

```json
{
  "email_enabled": true,
  "push_enabled": true,
  "sms_enabled": false,
  "in_app_enabled": true,
  "preferences": {}
}
```

### 9. Update User Preferences

```
PUT /api/notifications/preferences/
```

**Request:**

```json
{
  "email_enabled": true,
  "push_enabled": false,
  "in_app_enabled": true
}
```

---

## Notification Service Usage

### 1. Send Single Notification

```python
from apps.notifications.services import NotificationService
from apps.notifications.models import NotificationChannel

NotificationService.send_notification(
    user=user,
    title="Welcome!",
    message="Thanks for signing up",
    category="welcome",
    action_url="https://example.com/dashboard",
    channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL]
)
```

### 2. Send Bulk Notifications

```python
users = User.objects.filter(is_active=True)
NotificationService.send_bulk_notification(
    users=users,
    title="System Maintenance",
    message="We'll be down for maintenance tonight",
    category="system_alert",
    channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL]
)
```

### 3. Send to Tenant Users

```python
from apps.notifications.triggers import NotificationTriggers

NotificationTriggers.on_product_added(
    tenant=my_tenant,
    product_name="iPhone 15",
    added_by="Admin"
)
```

### 4. Send Activity Notification

```python
NotificationService.send_activity_notification(
    user=user,
    activity_type='product_added',
    activity_description="New iPhone 15 added to inventory"
)
```

---

## Notification Triggers

Pre-built notification triggers for common events:

### Tenant Management

```python
from apps.notifications.triggers import NotificationTriggers

# When tenant is created
NotificationTriggers.on_tenant_created(tenant, owner_user)

# When tenant is approved
NotificationTriggers.on_tenant_approved(tenant, owner_user)
```

### Staff Management

```python
# When staff is added
NotificationTriggers.on_staff_added(tenant, staff_user, role="Manager")

# When staff is removed
NotificationTriggers.on_staff_removed(tenant, staff_user)

# When staff role changes
NotificationTriggers.on_staff_role_changed(tenant, staff_user, new_role="Admin")
```

### Inventory Management

```python
# Product added
NotificationTriggers.on_product_added(tenant, "iPhone 15", added_by="Admin")

# Low stock
NotificationTriggers.on_product_stock_low(tenant, "iPhone 15", current_stock=5)

# Out of stock
NotificationTriggers.on_product_out_of_stock(tenant, "iPhone 15")

# Product deleted
NotificationTriggers.on_product_deleted(tenant, "iPhone 15", deleted_by="Admin")
```

### Sales & Orders

```python
# Order created
NotificationTriggers.on_order_created(tenant, order_id="ORD-001", total=50000)

# Order completed
NotificationTriggers.on_order_completed(tenant, order_id="ORD-001")

# Order cancelled
NotificationTriggers.on_order_cancelled(tenant, order_id="ORD-001", reason="Out of stock")
```

### User Management

```python
# Password changed
NotificationTriggers.on_password_changed(user)

# Profile updated
NotificationTriggers.on_profile_updated(user)
```

### System Notifications

```python
# Maintenance scheduled
NotificationTriggers.on_maintenance_scheduled(
    users_list=[user1, user2, user3],
    maintenance_time="Tonight at 2 AM"
)

# System alert
NotificationTriggers.on_system_alert(
    users_list=users,
    alert_message="Database backup in progress",
    severity="info"  # or "warning" or "critical"
)
```

### Analytics & Reports

```python
# Daily summary
NotificationTriggers.on_daily_summary(
    tenant=tenant,
    summary_data={
        'total_sales': 500000,
        'orders_count': 25,
        'new_products': 3
    }
)

# Low inventory report
NotificationTriggers.on_low_inventory_report(
    tenant=tenant,
    low_stock_items=[
        {'name': 'iPhone 15', 'stock': 2},
        {'name': 'Samsung S24', 'stock': 3},
    ]
)
```

---

## Database Models

### Notification Model

```python
- id (UUID)
- user (ForeignKey to User)
- title (CharField)
- message (TextField)
- html_message (TextField, optional)
- category (CharField)
- action_url (URLField, optional)
- channels (CharField) # "in_app,email"
- is_read (Boolean)
- is_sent (Boolean)
- created_at (DateTime)
```

### UserNotificationPreference Model

```python
- user (OneToOneField to User)
- email_enabled (Boolean)
- push_enabled (Boolean)
- sms_enabled (Boolean)
- in_app_enabled (Boolean)
- preferences (JSONField)
- updated_at (DateTime)
```

---

## Integration Checklist

To integrate notifications into your views/models:

- [ ] Import NotificationTriggers
- [ ] Call appropriate trigger after event
- [ ] Handle exceptions gracefully
- [ ] Test with admin panel and API

### Example Integration in View

```python
from apps.notifications.triggers import NotificationTriggers

def create_order(request):
    order = Order.objects.create(...)

    # Send notification
    try:
        NotificationTriggers.on_order_created(
            tenant=request.tenant,
            order_id=order.id,
            total=order.total
        )
    except Exception as e:
        print(f"Notification failed: {e}")

    return Response(order_data)
```

---

## Notification Categories

Built-in categories:

- `tenant_created` - Tenant setup
- `tenant_approved` - Tenant approved
- `staff_added` - Staff added
- `staff_removed` - Staff removed
- `staff_role_changed` - Staff role updated
- `product_added` - Product added
- `product_deleted` - Product removed
- `stock_low` - Low inventory
- `out_of_stock` - Out of stock
- `order_created` - New order
- `order_completed` - Order complete
- `order_cancelled` - Order cancelled
- `password_changed` - Password changed
- `profile_updated` - Profile updated
- `maintenance_scheduled` - Maintenance
- `system_alert` - System alert
- `daily_summary` - Daily report
- `low_inventory_report` - Inventory report

---

## Frontend Integration

### Get Unread Count

```javascript
const response = await fetch("/api/notifications/stats/");
const stats = await response.json();
console.log(stats.unread); // Shows unread count
```

### Load Notifications

```javascript
const response = await fetch("/api/notifications/?limit=20&offset=0");
const data = await response.json();
// data.results contains notifications
```

### Mark as Read

```javascript
await fetch(`/api/notifications/${notificationId}/mark-as-read/`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
});
```

### Real-time Updates (Polling)

```javascript
setInterval(async () => {
  const response = await fetch("/api/notifications/stats/");
  const stats = await response.json();
  updateNotificationBadge(stats.unread);
}, 30000); // Every 30 seconds
```

---

## Performance Tips

1. **Use pagination** - Limit results with `limit` parameter
2. **Filter by date** - Get recent notifications only
3. **Async sending** - Consider Celery for email sending
4. **Archive old** - Periodically delete notifications older than 30 days
5. **Index queries** - Database has indexes on common filters

---

## Configuration

Update these in your code:

1. **Email notification link** - Update URL in `services.py`
2. **Notification retention** - Delete old notifications in admin
3. **Channels** - Enable/disable by user preference

---

## Testing

```python
from apps.notifications.services import NotificationService
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Send test notification
NotificationService.send_notification(
    user=user,
    title="Test",
    message="This is a test notification"
)
```

---

## Status: ✅ Complete

The notification system is fully implemented and ready to use!

- ✅ API endpoints complete
- ✅ Serializers and views
- ✅ Service layer
- ✅ Triggers for common events
- ✅ Preference management
- ✅ Email integration
- ✅ Admin panel ready
