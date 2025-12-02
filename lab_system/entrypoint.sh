#!/bin/bash

# Exit on error
set -e

echo "Waiting for MySQL to be ready..."

# รอให้ MySQL พร้อมรับการเชื่อมต่อ
while ! nc -z $DB_HOST $DB_PORT; do
  echo "MySQL is unavailable - sleeping"
  sleep 1
done

echo "MySQL is up - continuing..."

# รัน migrations
echo "Running database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# สร้าง superuser อัตโนมัติถ้ายังไม่มี (optional)
echo "Checking for superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
EOF

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000
