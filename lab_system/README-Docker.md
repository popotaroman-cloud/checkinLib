# Lab Check-in System - Docker Setup Guide

## ข้อกำหนดเบื้องต้น
- Docker Desktop ติดตั้งและรันอยู่
- Docker Compose (มักจะมากับ Docker Desktop อยู่แล้ว)

## โครงสร้างไฟล์
```
lab_system/
├── Dockerfile              # คำสั่งสร้าง Docker image
├── docker-compose.yml      # กำหนด services (Django + MySQL + phpMyAdmin)
├── entrypoint.sh          # Script สำหรับรอ MySQL และรัน migrations
├── requirements.txt        # Python dependencies
├── .dockerignore          # ไฟล์ที่ไม่ต้องการคัดลอกเข้า Docker
├── .env.example           # ตัวอย่างไฟล์ environment variables
└── README-Docker.md       # คู่มือนี้
```

## การตั้งค่าระบบ

ระบบนี้ใช้ **Django + MySQL** โดย:
- **Django**: Web Framework
- **MySQL 8.0**: Database
- **phpMyAdmin**: Web UI สำหรับจัดการ MySQL
- **Auto Migration**: รัน migrations และสร้าง superuser อัตโนมัติ

## วิธีการใช้งาน

### 1. เริ่มต้นใช้งาน (ครั้งแรก)

```bash
# เข้าไปที่โฟลเดอร์ lab_system
cd lab_system

# Build และรัน containers (รอประมาณ 1-2 นาที)
docker-compose up --build
```

**ระบบจะทำอัตโนมัติ:**
- รอให้ MySQL พร้อม
- รัน migrations สร้างตารางในฐานข้อมูล
- สร้าง superuser (admin/admin123)
- รัน Django development server

### 2. การรันครั้งต่อไป

```bash
# รัน containers (ไม่ต้อง build ใหม่)
docker-compose up

# หรือรันในโหมด background
docker-compose up -d

# ดู logs
docker-compose logs -f web
```

### 3. เข้าถึง Application

- **Django App**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
  - Username: `admin`
  - Password: `admin123`
- **phpMyAdmin**: http://localhost:8080
  - Server: `db`
  - Username: `labuser` หรือ `root`
  - Password: `labpassword` หรือ `rootpassword`

### 4. คำสั่งที่ใช้บ่อย

```bash
# หยุด containers
docker-compose down

# หยุดและลบ volumes (ข้อมูลในฐานข้อมูลจะหายด้วย - ระวัง!)
docker-compose down -v

# ดู logs ของ Django
docker-compose logs -f web

# ดู logs ของ MySQL
docker-compose logs -f db

# ดู logs ทั้งหมด
docker-compose logs -f

# เข้าไปใน Django container
docker-compose exec web bash

# เข้าไปใน MySQL container
docker-compose exec db bash

# รัน Django management commands
docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py shell

# Rebuild containers (เมื่อมีการเปลี่ยน Dockerfile หรือ requirements.txt)
docker-compose up --build

# Restart เฉพาะ web service
docker-compose restart web
```

### 5. การจัดการ Database

**เข้าใช้งาน MySQL ผ่าน Command Line:**
```bash
# เข้า MySQL shell
docker-compose exec db mysql -u labuser -p
# Password: labpassword

# หรือใช้ root
docker-compose exec db mysql -u root -p
# Password: rootpassword
```

**Backup Database:**
```bash
# Backup ฐานข้อมูล
docker-compose exec db mysqldump -u root -prootpassword lab_checkin_db > backup.sql

# Restore ฐานข้อมูล
docker-compose exec -T db mysql -u root -prootpassword lab_checkin_db < backup.sql
```

### 6. สร้าง Superuser เพิ่มเติม

ระบบสร้าง admin/admin123 ให้อัตโนมัติแล้ว แต่ถ้าต้องการสร้างเพิ่ม:

```bash
docker-compose exec web python manage.py createsuperuser
```

จากนั้นกรอกข้อมูล:
- Username
- Email (optional)
- Password

## การแก้ปัญหา

### ปัญหา: Port ถูกใช้งานอยู่แล้ว

ถ้า port 8000, 3306 หรือ 8080 ถูกใช้งานอยู่ ให้แก้ไขใน `docker-compose.yml`:

```yaml
# สำหรับ Django
ports:
  - "8001:8000"  # เปลี่ยนจาก 8000 เป็น 8001

# สำหรับ MySQL
ports:
  - "3307:3306"  # เปลี่ยนจาก 3306 เป็น 3307

# สำหรับ phpMyAdmin
ports:
  - "8081:80"    # เปลี่ยนจาก 8080 เป็น 8081
```

### ปัญหา: MySQL connection error

```bash
# ตรวจสอบว่า MySQL container รันอยู่และสถานะเป็น healthy
docker-compose ps

# ดู logs ของ MySQL
docker-compose logs db

# ดู logs ของ Django
docker-compose logs web

# ลองรอให้ MySQL พร้อมแล้ว restart web
docker-compose restart web
```

### ปัญหา: Migrations ไม่ทำงาน

```bash
# ลบ containers และ volumes แล้วสร้างใหม่
docker-compose down -v
docker-compose up --build

# หรือรัน migrations manually
docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate
```

### ปัญหา: entrypoint.sh permission denied (Linux/Mac)

```bash
# ให้ permission execute กับไฟล์ entrypoint.sh
chmod +x entrypoint.sh
docker-compose up --build
```

### ปัญหา: ข้อมูลหายหลังปิด container

นี่เป็นเรื่องปกติถ้าใช้ `docker-compose down -v` เพราะจะลบ volumes ด้วย

**วิธีแก้:**
- ใช้ `docker-compose down` แทน (ไม่มี -v)
- หรือ backup database ก่อน

## โครงสร้าง Docker Services

### 1. db (MySQL Database)
- **Image**: mysql:8.0
- **Port**: 3306
- **Database**: lab_checkin_db
- **Users**:
  - root / rootpassword (full access)
  - labuser / labpassword (app user)
- **Volume**: mysql_data (persistent storage)
- **Features**: Healthcheck เพื่อให้ web service รอให้ MySQL พร้อมก่อน

### 2. web (Django Application)
- **Port**: 8000
- **Database**: MySQL (กำหนดผ่าน environment variables)
- **Auto Features**:
  - รอให้ MySQL พร้อม
  - รัน makemigrations และ migrate อัตโนมัติ
  - สร้าง superuser (admin/admin123) อัตโนมัติ
  - Collect static files
- **Volume**: mount โฟลเดอร์ปัจจุบันเพื่อให้แก้โค้ดได้ทันที

### 3. phpmyadmin (Web UI)
- **Port**: 8080
- **Features**: จัดการ MySQL ผ่าน Web Browser
- **Login**: ใช้ credentials เดียวกับ MySQL

## Environment Variables

ระบบใช้ environment variables ดังนี้:

```env
# Django
DEBUG=True
SECRET_KEY=django-insecure-change-me-please-for-production

# Database
DB_ENGINE=mysql
DB_NAME=lab_checkin_db
DB_USER=labuser
DB_PASSWORD=labpassword
DB_HOST=db
DB_PORT=3306
```

## การ Deploy ขึ้น Production

**⚠️ IMPORTANT: ห้ามใช้การตั้งค่านี้บน Production โดยตรง!**

สำหรับ production ต้องทำดังนี้:

1. **Security:**
   - เปลี่ยน SECRET_KEY ใหม่ (ใช้ random string ยาวๆ)
   - เปลี่ยน passwords ทั้งหมด (MySQL root, user)
   - ตั้ง DEBUG=False
   - ตั้ง ALLOWED_HOSTS ให้ถูกต้อง

2. **Web Server:**
   - ใช้ Gunicorn หรือ uWSGI แทน `runserver`
   - ใช้ Nginx เป็น reverse proxy
   - ตั้งค่า SSL/TLS (HTTPS)

3. **Database:**
   - ใช้ managed MySQL (AWS RDS, Google Cloud SQL, etc.)
   - หรือตั้งค่า MySQL ให้ secure
   - ตั้งค่า backup อัตโนมัติ
   - ใช้ strong passwords

4. **Static Files:**
   - ใช้ WhiteNoise หรือ CDN
   - Collect static files ไปยัง persistent volume

5. **Monitoring:**
   - ตั้งค่า logging
   - ใช้ monitoring tools (Sentry, etc.)
   - Health checks

## ข้อมูลเพิ่มเติม

- [Django Documentation](https://docs.djangoproject.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## Quick Reference

```bash
# เริ่มต้นครั้งแรก
docker-compose up --build

# รันปกติ
docker-compose up

# รันในพื้นหลัง
docker-compose up -d

# หยุด
docker-compose down

# ดู logs
docker-compose logs -f web

# เข้า shell
docker-compose exec web bash
docker-compose exec web python manage.py shell

# รัน migrations
docker-compose exec web python manage.py makemigrations
docker-compose exec web python manage.py migrate

# สร้าง superuser
docker-compose exec web python manage.py createsuperuser
```
