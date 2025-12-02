from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-change-me-please-for-production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True



# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # App ของเรา
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.AdminAuthenticationMiddleware',  # Custom middleware สำหรับ /manager/ และ /api/
]

ROOT_URLCONF = 'lab_system.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], # ชี้ไปที่โฟลเดอร์ templates ที่ root
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lab_system.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# อ่านค่าจาก environment variables สำหรับ Docker
DB_ENGINE = os.getenv('DB_ENGINE', 'sqlite')

if DB_ENGINE == 'mysql':
    # MySQL Configuration (สำหรับ Docker)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME', 'lab_checkin_db'),
            'USER': os.getenv('DB_USER', 'labuser'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'labpassword'),
            'HOST': os.getenv('DB_HOST', 'db'),
            'PORT': os.getenv('DB_PORT', '3306'),
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            }
        }
    }
else:
    # SQLite Configuration (Default สำหรับ Development)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'th' # ตั้งเป็นภาษาไทย

TIME_ZONE = 'Asia/Bangkok' # เวลาไทย

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    BASE_DIR / "static", # ชี้ไปที่โฟลเดอร์ static ที่ root
]

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ALLOWED_HOSTS - อนุญาตทุก host (สำหรับ development และ ngrok)
ALLOWED_HOSTS = ['*']

# CSRF_TRUSTED_ORIGINS - อนุญาต ngrok และ localhost
CSRF_TRUSTED_ORIGINS = [
    'https://*.ngrok-free.app',
    'https://*.ngrok-free.dev',
    'https://*.ngrok.io',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# Authentication settings
LOGIN_URL = '/manager/login/'
LOGIN_REDIRECT_URL = '/manager/dashboard/'
LOGOUT_REDIRECT_URL = '/'