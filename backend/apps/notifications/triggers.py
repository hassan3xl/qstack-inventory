"""
Notification triggers for common events in the system.
These can be imported and used in views/signals when events occur.
"""

from typing import Optional
from django.contrib.auth import get_user_model
from apps.notifications.services import NotificationService
from apps.notifications.models import NotificationChannel

User = get_user_model()


class NotificationTriggers:
    """Common notification triggers for system events"""
    
    # ============ TENANT MANAGEMENT ============
    
    @staticmethod
    def on_tenant_created(tenant, owner_user: User):
        """Send notification when tenant is created"""
        return NotificationService.send_notification(
            user=owner_user,
            title="🎉 Business Setup Complete",
            message=f"Your business '{tenant.name}' has been successfully created. "
                   f"You can now start managing your inventory.",
            category="tenant_created",
            action_url="https://qstack-inventory.com/dashboard",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    @staticmethod
    def on_tenant_approved(tenant, owner_user: User):
        """Send notification when tenant is approved"""
        return NotificationService.send_notification(
            user=owner_user,
            title="✅ Business Approved",
            message=f"Your business '{tenant.name}' has been approved and is now active. "
                   f"Your team members can now log in.",
            category="tenant_approved",
            action_url="https://qstack-inventory.com/dashboard",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    # ============ STAFF MANAGEMENT ============
    
    @staticmethod
    def on_staff_added(tenant, staff_user: User, role: str):
        """Send notification when staff is added"""
        return NotificationService.send_notification(
            user=staff_user,
            title=f"👤 Added to {tenant.name}",
            message=f"You have been added to {tenant.name} as a {role}. "
                   f"Log in to your dashboard to get started.",
            category="staff_added",
            action_url="https://qstack-inventory.com/dashboard",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    @staticmethod
    def on_staff_removed(tenant, staff_user: User):
        """Send notification when staff is removed"""
        return NotificationService.send_notification(
            user=staff_user,
            title=f"❌ Removed from {tenant.name}",
            message=f"You have been removed from {tenant.name}. "
                   f"Contact the business owner if you believe this is a mistake.",
            category="staff_removed",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    @staticmethod
    def on_staff_role_changed(tenant, staff_user: User, new_role: str):
        """Send notification when staff role changes"""
        return NotificationService.send_notification(
            user=staff_user,
            title=f"🔄 Role Updated in {tenant.name}",
            message=f"Your role in {tenant.name} has been updated to {new_role}.",
            category="staff_role_changed",
            action_url="https://qstack-inventory.com/dashboard",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    # ============ INVENTORY MANAGEMENT ============
    
    @staticmethod
    def on_product_added(tenant, product_name: str, added_by: str):
        """Send notification when product is added"""
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="📦 New Product Added",
            message=f"New product '{product_name}' has been added by {added_by}.",
            category="product_added",
            action_url="https://qstack-inventory.com/inventory/products",
            channels=[NotificationChannel.IN_APP],
        )
    
    @staticmethod
    def on_product_stock_low(tenant, product_name: str, current_stock: int):
        """Send notification when product stock is low"""
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="⚠️ Low Stock Alert",
            message=f"Product '{product_name}' has low stock (Current: {current_stock} units). "
                   f"Consider restocking soon.",
            category="stock_low",
            action_url="https://qstack-inventory.com/inventory/products",
            channels=[NotificationChannel.IN_APP],
        )
    
    @staticmethod
    def on_product_out_of_stock(tenant, product_name: str):
        """Send notification when product is out of stock"""
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="❌ Out of Stock",
            message=f"Product '{product_name}' is now out of stock. "
                   f"Customers will not be able to purchase this item.",
            category="out_of_stock",
            action_url="https://qstack-inventory.com/inventory/products",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    @staticmethod
    def on_product_deleted(tenant, product_name: str, deleted_by: str):
        """Send notification when product is deleted"""
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="🗑️ Product Removed",
            message=f"Product '{product_name}' has been removed by {deleted_by}.",
            category="product_deleted",
            channels=[NotificationChannel.IN_APP],
        )
    
    # ============ SALES & ORDERS ============
    
    @staticmethod
    def on_order_created(tenant, order_id: str, total: float):
        """Send notification when new order is created"""
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="📋 New Order",
            message=f"New order #{order_id} received (Total: ₦{total:,.2f}). "
                   f"Click to view details.",
            category="order_created",
            action_url=f"https://qstack-inventory.com/sales/orders/{order_id}",
            channels=[NotificationChannel.IN_APP],
        )
    
    @staticmethod
    def on_order_completed(tenant, order_id: str):
        """Send notification when order is completed"""
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="✅ Order Completed",
            message=f"Order #{order_id} has been completed and delivered.",
            category="order_completed",
            action_url=f"https://qstack-inventory.com/sales/orders/{order_id}",
            channels=[NotificationChannel.IN_APP],
        )
    
    @staticmethod
    def on_order_cancelled(tenant, order_id: str, reason: str = None):
        """Send notification when order is cancelled"""
        message = f"Order #{order_id} has been cancelled."
        if reason:
            message += f" Reason: {reason}"
        
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="❌ Order Cancelled",
            message=message,
            category="order_cancelled",
            channels=[NotificationChannel.IN_APP],
        )
    
    # ============ USER MANAGEMENT ============
    
    @staticmethod
    def on_password_changed(user: User):
        """Send notification when password is changed"""
        return NotificationService.send_notification(
            user=user,
            title="🔐 Password Changed",
            message="Your password has been successfully changed. "
                   f"If you didn't make this change, please reset your password immediately.",
            category="password_changed",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    @staticmethod
    def on_profile_updated(user: User):
        """Send notification when user profile is updated"""
        return NotificationService.send_notification(
            user=user,
            title="✏️ Profile Updated",
            message="Your profile has been updated successfully.",
            category="profile_updated",
            channels=[NotificationChannel.IN_APP],
        )
    
    # ============ SYSTEM NOTIFICATIONS ============
    
    @staticmethod
    def on_maintenance_scheduled(users_list, maintenance_time: str):
        """Send notification about scheduled maintenance"""
        return NotificationService.send_bulk_notification(
            users=users_list,
            title="🔧 Scheduled Maintenance",
            message=f"We'll be performing scheduled maintenance on {maintenance_time}. "
                   f"The system may be temporarily unavailable during this time.",
            category="maintenance_scheduled",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    @staticmethod
    def on_system_alert(users_list, alert_message: str, severity: str = "info"):
        """Send system alert notifications"""
        title_map = {
            "info": "ℹ️ System Notification",
            "warning": "⚠️ Warning",
            "critical": "🚨 Critical Alert",
        }
        
        return NotificationService.send_bulk_notification(
            users=users_list,
            title=title_map.get(severity, "System Alert"),
            message=alert_message,
            category="system_alert",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
    
    # ============ ANALYTICS & REPORTS ============
    
    @staticmethod
    def on_daily_summary(tenant, summary_data: dict):
        """Send daily summary notification"""
        message = f"<strong>Daily Summary</strong><br>"
        message += f"Total Sales: ₦{summary_data.get('total_sales', 0):,.2f}<br>"
        message += f"Orders: {summary_data.get('orders_count', 0)}<br>"
        message += f"New Products: {summary_data.get('new_products', 0)}"
        
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="📊 Daily Summary",
            message=message,
            category="daily_summary",
            action_url="https://qstack-inventory.com/analytics/dashboard",
            channels=[NotificationChannel.IN_APP],
        )
    
    @staticmethod
    def on_low_inventory_report(tenant, low_stock_items: list):
        """Send low inventory alert"""
        items_list = ", ".join([f"{item['name']} ({item['stock']})" for item in low_stock_items[:5]])
        message = f"The following items have low stock: {items_list}"
        if len(low_stock_items) > 5:
            message += f" and {len(low_stock_items) - 5} more."
        
        return NotificationService.send_notification_to_tenant_users(
            tenant=tenant,
            title="📉 Low Inventory Alert",
            message=message,
            category="low_inventory_report",
            action_url="https://qstack-inventory.com/inventory/low-stock",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )

    @staticmethod
    def on_tenant_name_changed(tenant, old_name: str, new_name: str, updated_by: User):
        """Send notification to admin, staff, and platform admins when store name is updated"""
        from apps.notifications.services import NotificationService
        from apps.notifications.models import NotificationChannel
        from django.db.models import Q
        
        # 1. Store users (Owner, Admin, Managers, Cashiers, Staff)
        tenant_users = User.objects.filter(
            tenant_roles__tenant=tenant
        ).distinct()
        
        # 2. Platform Admins
        platform_admins = User.objects.filter(
            Q(role=User.RoleChoices.PLATFORM_ADMIN) | Q(is_superuser=True)
        ).distinct()
        
        # Send to tenant users (excluding the one who updated it, or send to all including owner)
        NotificationService.send_bulk_notification(
            users=tenant_users,
            title="🏢 Store Renamed",
            message=f"The store name has been updated from '{old_name}' to '{new_name}' by {updated_by.email}.",
            category="store_renamed",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )
        
        # Send to platform admins
        NotificationService.send_bulk_notification(
            users=platform_admins,
            title="🏢 Store Name Updated",
            message=f"The tenant store '{old_name}' (ID: {tenant.id}) has been renamed to '{new_name}' by {updated_by.email}.",
            category="store_renamed",
            channels=[NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        )

