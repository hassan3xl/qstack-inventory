
from django.db import models
import uuid
from cloudinary.models import CloudinaryField
from apps.tenants.models import TenantBaseModel


class Category(TenantBaseModel):
    """
    Product category. Each category is scoped to a business type so that
    only relevant categories are surfaced per store (e.g. a pharmacy sees
    drug-related categories, a clothing store sees garment categories).

    Tenant-scoped categories override or extend the defaults — a tenant can
    create their own custom categories, which are stored with their tenant FK.
    Global/preset categories have tenant=None.
    """

    # Mirror Tenant.BusinessType so we can filter categories per store type
    class BusinessType(models.TextChoices):
        GROCERY      = 'grocery',      'Grocery & Provisions'
        PHARMACY     = 'pharmacy',     'Pharmacy & Medicine'
        ELECTRONICS  = 'electronics',  'Electronics & Gadgets'
        CLOTHING     = 'clothing',     'Clothing & Apparel'
        GENERAL      = 'general',      'General Retail'
        OTHER        = 'other',        'Other'

    class ExpiryStrategy(models.TextChoices):
        PERISHABLE = 'PERISHABLE', 'Perishable (Fresh Foods)'
        STABLE     = 'STABLE',     'Stable (Canned, Biscuits)'
        MEDICAL    = 'MEDICAL',    'Medical (Drugs, Medications)'
        GENERAL    = 'GENERAL',    'General (Non-food items)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image = CloudinaryField('image', folder='categories/', blank=True, null=True)

    # Which store type this category belongs to
    business_type = models.CharField(
        max_length=50,
        choices=BusinessType.choices,
        default=BusinessType.GENERAL,
        db_index=True,
    )

    # Expiry / shelf-life defaults
    default_best_before_days = models.PositiveIntegerField(
        default=0,
        help_text="Default number of days before products in this category expire (0 = no default)"
    )
    expiry_strategy = models.CharField(
        max_length=20,
        choices=ExpiryStrategy.choices,
        default=ExpiryStrategy.GENERAL,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_business_type_display()})"

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['business_type', 'name']

    # ------------------------------------------------------------------ #
    #  Preset categories seeded via data migration                         #
    # ------------------------------------------------------------------ #
    PRESETS = {
        'grocery': [
            {'name': 'Grains & Cereals',      'expiry_strategy': 'STABLE',     'default_best_before_days': 365},
            {'name': 'Dairy & Eggs',           'expiry_strategy': 'PERISHABLE', 'default_best_before_days': 14},
            {'name': 'Meat & Poultry',         'expiry_strategy': 'PERISHABLE', 'default_best_before_days': 5},
            {'name': 'Fish & Seafood',         'expiry_strategy': 'PERISHABLE', 'default_best_before_days': 3},
            {'name': 'Fruits & Vegetables',    'expiry_strategy': 'PERISHABLE', 'default_best_before_days': 7},
            {'name': 'Bread & Bakery',         'expiry_strategy': 'PERISHABLE', 'default_best_before_days': 5},
            {'name': 'Canned & Preserved',     'expiry_strategy': 'STABLE',     'default_best_before_days': 730},
            {'name': 'Cooking Oils & Fats',    'expiry_strategy': 'STABLE',     'default_best_before_days': 540},
            {'name': 'Spices & Seasonings',    'expiry_strategy': 'STABLE',     'default_best_before_days': 730},
            {'name': 'Snacks & Confectionery', 'expiry_strategy': 'STABLE',     'default_best_before_days': 180},
            {'name': 'Beverages',              'expiry_strategy': 'STABLE',     'default_best_before_days': 365},
            {'name': 'Household & Cleaning',   'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Baby & Infant',          'expiry_strategy': 'STABLE',     'default_best_before_days': 365},
            {'name': 'Frozen Foods',           'expiry_strategy': 'PERISHABLE', 'default_best_before_days': 90},
        ],
        'pharmacy': [
            {'name': 'Prescription Drugs',     'expiry_strategy': 'MEDICAL',    'default_best_before_days': 730},
            {'name': 'Over-the-Counter (OTC)', 'expiry_strategy': 'MEDICAL',    'default_best_before_days': 730},
            {'name': 'Vitamins & Supplements', 'expiry_strategy': 'MEDICAL',    'default_best_before_days': 365},
            {'name': 'First Aid & Wound Care', 'expiry_strategy': 'MEDICAL',    'default_best_before_days': 1095},
            {'name': 'Medical Devices',        'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Personal Care',          'expiry_strategy': 'GENERAL',    'default_best_before_days': 730},
            {'name': 'Baby & Maternal Health', 'expiry_strategy': 'MEDICAL',    'default_best_before_days': 365},
            {'name': 'Eye & Ear Care',         'expiry_strategy': 'MEDICAL',    'default_best_before_days': 365},
            {'name': 'Dermatology & Skin',     'expiry_strategy': 'GENERAL',    'default_best_before_days': 730},
            {'name': 'Oral Health',            'expiry_strategy': 'GENERAL',    'default_best_before_days': 730},
        ],
        'electronics': [
            {'name': 'Smartphones & Tablets',  'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Laptops & Computers',    'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Audio & Headphones',     'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Cameras & Photography',  'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'TV & Home Theatre',      'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Accessories & Cables',   'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Power & Batteries',      'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Smart Home',             'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Gaming',                 'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Networking',             'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
        ],
        'clothing': [
            {'name': "Men's Wear",             'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': "Women's Wear",           'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': "Children's Wear",        'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Footwear',               'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Accessories & Bags',     'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Sportswear & Activewear','expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Underwear & Lingerie',   'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Traditional & Ethnic',   'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Formal & Office Wear',   'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
        ],
        'general': [
            {'name': 'Miscellaneous',          'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Stationery & Office',    'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Tools & Hardware',       'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
            {'name': 'Home & Kitchen',         'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
        ],
        'other': [
            {'name': 'Uncategorised',          'expiry_strategy': 'GENERAL',    'default_best_before_days': 0},
        ],
    }