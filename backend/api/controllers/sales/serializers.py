from rest_framework import serializers
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal
from apps.products.models import Product, StockBatch
from apps.sales.models import Sale, SaleItem, Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']

class SaleItemSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(write_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    capacity = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'total_price', 'variant', 'capacity']
        read_only_fields = ['id', 'unit_price', 'total_price']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    cashier_email = serializers.CharField(source='cashier.email', read_only=True)
    cashier_name = serializers.SerializerMethodField()
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.UUIDField(required=False, write_only=True, allow_null=True)
    customer_name = serializers.CharField(required=False, write_only=True, allow_null=True)
    customer_phone = serializers.CharField(required=False, write_only=True, allow_null=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'cashier_email', 'cashier_name', 'customer', 'customer_id', 
            'customer_name', 'customer_phone', 'subtotal', 'tax', 
            'discount', 'total_amount', 'payment_method', 
            'payment_status', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'sale_number', 'cashier_email', 'cashier_name', 'subtotal', 'total_amount', 'created_at']

    def get_cashier_name(self, obj):
        if obj.cashier:
            profile = getattr(obj.cashier, 'profile', None)
            if profile:
                full_name = f"{profile.first_name} {profile.last_name}".strip()
                if full_name:
                    return full_name
            return obj.cashier.email
        return "System"

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one product item is required for a sale.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer_id = validated_data.pop('customer_id', None)
        customer_name = validated_data.pop('customer_name', None)
        customer_phone = validated_data.pop('customer_phone', None)

        request = self.context.get('request')
        user = request.user if request else None
        tenant = getattr(request, 'tenant', None) if request else None

        customer = None
        if customer_id:
            try:
                customer = Customer.objects.get(id=customer_id, tenant=tenant)
            except Customer.DoesNotExist:
                pass
        
        if not customer and customer_name and customer_phone:
            customer, created = Customer.objects.get_or_create(
                tenant=tenant,
                phone=customer_phone,
                defaults={'name': customer_name}
            )
            if not created and customer.name != customer_name:
                customer.name = customer_name
                customer.save()

        with transaction.atomic():
            sale = Sale.objects.create(
                cashier=user,
                customer=customer,
                subtotal=Decimal('0.00'),
                tax=Decimal(str(validated_data.get('tax', '0.00'))),
                discount=Decimal(str(validated_data.get('discount', '0.00'))),
                total_amount=Decimal('0.00'),
                payment_method=validated_data.get('payment_method', 'cash'),
                payment_status=validated_data.get('payment_status', 'paid')
            )

            calculated_subtotal = Decimal('0.00')

            for item_data in items_data:
                product_id = item_data['product_id']
                qty = item_data['quantity']
                variant = item_data.get('variant', None)
                capacity = item_data.get('capacity', None)

                product = get_object_or_404(Product, id=product_id)

                if product.stock < qty:
                    raise serializers.ValidationError(
                        f"Insufficient stock for product '{product.name}'. Requested: {qty}, Available: {product.stock}"
                    )

                # Deduct stock using FEFO (First Expired First Out)
                from django.utils import timezone
                now = timezone.now().date()

                expiry_batches = list(
                    product.batches.filter(
                        quantity__gt=0, 
                        expiry_date__isnull=False,
                        expiry_date__gte=now
                    ).order_by('expiry_date')
                )
                no_expiry_batches = list(
                    product.batches.filter(quantity__gt=0, expiry_date__isnull=True).order_by('created_at')
                )
                
                ordered_batches = expiry_batches + no_expiry_batches
                
                remaining_qty = qty
                for batch in ordered_batches:
                    if remaining_qty <= 0:
                        break
                    
                    if batch.quantity >= remaining_qty:
                        batch.quantity -= remaining_qty
                        batch.save()
                        remaining_qty = 0
                    else:
                        remaining_qty -= batch.quantity
                        batch.quantity = 0
                        batch.save()

                # Force product total stock updates
                product.update_stock_from_batches()

                # Resolve unit price: use capacity-based price if applicable
                unit_price = product.unit_price
                if capacity and product.capacities:
                    for cap in product.capacities:
                        if isinstance(cap, dict) and cap.get('name') == capacity and cap.get('price'):
                            try:
                                unit_price = Decimal(str(cap['price']))
                            except Exception:
                                pass
                            break

                total_price = unit_price * qty
                calculated_subtotal += total_price

                SaleItem.objects.create(
                    sale=sale,
                    product=product,
                    quantity=qty,
                    unit_price=unit_price,
                    total_price=total_price,
                    variant=variant,
                    capacity=capacity,
                )

            sale.subtotal = calculated_subtotal
            sale.total_amount = calculated_subtotal + sale.tax - sale.discount
            if sale.total_amount < 0:
                sale.total_amount = 0
            sale.save()

            return sale
