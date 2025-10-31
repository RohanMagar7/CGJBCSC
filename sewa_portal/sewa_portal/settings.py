import os
from pathlib import Path
import dj_database_url
from datetime import timedelta
from dotenv import load_dotenv

# Load .env for local development
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------
# SECURITY CONFIGURATION
# ------------------------
# NOTE: Do NOT commit secrets to source. Expect environment variables to be
# provided in production. For local development you can create a `.env` file
# (see `.env.example`) and use python-dotenv to load it (already configured).
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '')
# Default to False unless explicitly enabled in environment to avoid
# accidentally running with DEBUG=True in production.
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'

raw_allowed_hosts = os.environ.get('DJANGO_ALLOWED_HOSTS')
if raw_allowed_hosts:
    ALLOWED_HOSTS = [h.strip() for h in raw_allowed_hosts.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        'cgjbcsc.onrender.com',
        'https://chhatrapatigraphicandjaybhagwan.netlify.app',
    ]

# ------------------------
# APPLICATIONS
# ------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'core',
    'rest_framework',
    'storages',  # Django-storages for custom backends
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # after SecurityMiddleware
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sewa_portal.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_USER_MODEL = 'core.User'
WSGI_APPLICATION = 'sewa_portal.wsgi.application'

# ------------------------
# DATABASE CONFIGURATION
# ------------------------
# DATABASE CONFIGURATION
# Prefer an explicit DATABASE_URL in the environment (production). If it's not
# set, fall back to a local SQLite database for development to avoid attempting
# DNS resolution of a production host during local runs.
DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()

if DATABASE_URL:
    # Only use dj_database_url if DATABASE_URL is set and not empty
    try:
        DATABASES = {
            'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
        }
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        # Fallback to SQLite if parsing fails
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    # Local development fallback
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ------------------------
# REST FRAMEWORK
# ------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

# Throttle rates used by scoped throttles (e.g. password reset requests)
REST_FRAMEWORK.setdefault('DEFAULT_THROTTLE_RATES', {})
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'].setdefault('password_reset', os.environ.get('PASSWORD_RESET_THROTTLE', '5/hour'))

# ------------------------
# PASSWORD VALIDATION
# ------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ------------------------
# INTERNATIONALIZATION
# ------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ------------------------
# STATIC & MEDIA FILES
# ------------------------
# STATIC & MEDIA FILES
# ------------------------
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# STATICFILES_STORAGE moved to STORAGES setting below

# ------------------------
# DROPBOX STORAGE CONFIGURATION (NO LOCAL STORAGE)
# ------------------------
# All files are stored in Dropbox - no local media folder is used
# Database stores only the file path, actual files are in Dropbox

# Preferred: Use refresh token (auto-renews, never expires)
# Preferred: Use refresh token (auto-renews, never expires)
# Values MUST come from environment in production. No default secrets here.
DROPBOX_APP_KEY = os.environ.get('DROPBOX_APP_KEY', '')
DROPBOX_APP_SECRET = os.environ.get('DROPBOX_APP_SECRET', '')
DROPBOX_REFRESH_TOKEN = os.environ.get('DROPBOX_REFRESH_TOKEN', '')

# Fallback: Access token (expires periodically - not recommended)
DROPBOX_ACCESS_TOKEN = os.environ.get('DROPBOX_ACCESS_TOKEN', '')

# Dropbox settings
DROPBOX_ROOT_PATH = os.environ.get('DROPBOX_ROOT_PATH', '/sewa_portal')
DROPBOX_TIMEOUT = int(os.environ.get('DROPBOX_TIMEOUT', '100'))

# Django 4.2+ uses STORAGES setting (replaces DEFAULT_FILE_STORAGE)
STORAGES = {
    "default": {
        "BACKEND": "core.storage_backends.DropboxStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# MEDIA_URL is not used - files are served directly from Dropbox via temporary URLs
# No MEDIA_ROOT defined - no local media folder will be created


# ------------------------
# EMAIL CONFIGURATION
# ------------------------
# Email configuration: default to SMTP but allow alternate backends via env vars.
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
# Use a safe default for DEFAULT_FROM_EMAIL to avoid 'None' in From header.
# Avoid using a real personal email as a fallback in source.
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', os.environ.get('EMAIL_HOST_USER') or 'no-reply@example.com')

# --- Anymail (SendGrid) integration (optional) ---------------------------------
# If you set SENDGRID_API_KEY in the environment, we'll prefer Anymail's SendGrid
# backend. This is recommended for production reliability. To enable, set:
#   SENDGRID_API_KEY=your_sendgrid_api_key
# Optionally also set DEFAULT_FROM_EMAIL to a verified sender for your provider.
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
if SENDGRID_API_KEY:
    # Lazy add anymail to INSTALLED_APPS if not already present
    if 'anymail' not in INSTALLED_APPS:
        INSTALLED_APPS.append('anymail')

    ANYMAIL = {
        'SENDGRID_API_KEY': SENDGRID_API_KEY,
    }

    # Prefer Anymail's SendGrid backend when API key is present
    EMAIL_BACKEND = 'anymail.backends.sendgrid.EmailBackend'
# -----------------------------------------------------------------------------

# ------------------------
# SIMPLE JWT CONFIGURATION
# ------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'USER_ID_FIELD': 'user_id',
    'USER_ID_CLAIM': 'user_id',
}

# ------------------------
# CORS CONFIGURATION
# ------------------------
raw_cors = os.environ.get('CORS_ALLOWED_ORIGINS')
if raw_cors:
    CORS_ALLOWED_ORIGINS = [u.strip() for u in raw_cors.split(',') if u.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative frontend port
        "http://127.0.0.1:5173",  # IPv4 localhost
        "http://127.0.0.1:3000",
        "https://chhatrapatigraphicandjaybhagwan.netlify.app"  # Production frontend
    ]
CORS_ALLOW_CREDENTIALS = True

# ------------------------
# PRODUCTION SECURITY SETTINGS
# ------------------------
# These settings are automatically applied when environment variables are set
# Required for Django deployment checklist to pass

# SSL/HTTPS Settings (only in production when SECURE_SSL_REDIRECT is set)
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # For Render proxy

# HTTP Strict Transport Security (HSTS)
SECURE_HSTS_SECONDS = int(os.environ.get('SECURE_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.environ.get('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'False') == 'True'
SECURE_HSTS_PRELOAD = os.environ.get('SECURE_HSTS_PRELOAD', 'False') == 'True'

# Cookie Security (only secure in production)
SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False') == 'True'

# Additional Security Headers
SECURE_BROWSER_XSS_FILTER = os.environ.get('SECURE_BROWSER_XSS_FILTER', 'True') == 'True'
SECURE_CONTENT_TYPE_NOSNIFF = os.environ.get('SECURE_CONTENT_TYPE_NOSNIFF', 'True') == 'True'
X_FRAME_OPTIONS = 'DENY'

# ------------------------
# DEFAULT AUTO FIELD
# ------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ------------------------
# Runtime safety checks
# ------------------------
# If running in production (DEBUG=False), require a secret key and important
# credentials to be present. This fails fast and avoids running with unsafe
# defaults.
if not SECRET_KEY:
    if DEBUG:
        # In development, warn and fall back to an insecure development secret
        # so local runs are still possible when developers forget to set envs.
        print("Warning: DJANGO_SECRET_KEY not set; running in DEBUG mode with an insecure secret key.")
        SECRET_KEY = 'unsafe-development-secret'
    else:
        raise RuntimeError('DJANGO_SECRET_KEY environment variable not set. Set it for production.')

# Warn if Dropbox credentials are missing when running in non-debug mode
if not DEBUG and not (DROPBOX_APP_KEY and DROPBOX_APP_SECRET and DROPBOX_REFRESH_TOKEN):
    # Do not raise here because some deployments may not use Dropbox, but log
    # a clear message to help with debugging.
    print('Warning: Dropbox credentials are not fully configured (DROPBOX_APP_KEY / DROPBOX_APP_SECRET / DROPBOX_REFRESH_TOKEN).')

