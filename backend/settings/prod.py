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
)

SECRET_KEY = SECRET_KEY
DEBUG = DEBUG
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

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")


