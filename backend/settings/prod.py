from .base import *
import os
import dj_database_url
from dotenv import load_dotenv

load_dotenv()

from src.config import (
    PRODUCTION_DB,
    SECRET_KEY,
    ALLOWED_HOSTS,
    DEBUG,
    CORS_ALLOWED_ORIGINS,
    RESEND_API_KEY
)

SECRET_KEY = SECRET_KEY
DEBUG = True
ALLOWED_HOSTS = ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS=CORS_ALLOWED_ORIGINS

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get("PRODUCTION_DB"),
        conn_max_age=600,
        ssl_require=True,
    )
}

# Free-tier friendly cache
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

LOGGING = {
    "version": 1,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
}


SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

if "whitenoise.middleware.WhiteNoiseMiddleware" not in MIDDLEWARE:
    try:
        idx = MIDDLEWARE.index("django.middleware.security.SecurityMiddleware")
        MIDDLEWARE.insert(idx + 1, "whitenoise.middleware.WhiteNoiseMiddleware")
    except ValueError:
        MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.resend.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'resend'
# Try to get from environ, fallback to the one loaded by dotenv in config
EMAIL_HOST_PASSWORD = os.environ.get('RESEND_API_KEY', RESEND_API_KEY)
DEFAULT_FROM_EMAIL = 'Qstack Inventory <noreply@mail.qstack.com.ng>'