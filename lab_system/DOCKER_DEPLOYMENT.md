# 🐳 Docker Deployment Guide - Lab Check-in System

## 📋 สารบัญ
1. [ข้อกำหนดระบบ](#ข้อกำหนดระบบ)
2. [การติดตั้ง Docker](#การติดตั้ง-docker)
3. [การรันระบบ](#การรันระบบ)
4. [การเข้าถึงระบบ](#การเข้าถึงระบบ)
5. [การจัดการระบบ](#การจัดการระบบ)
6. [Authentication](#authentication)
7. [Troubleshooting](#troubleshooting)

---

## 📦 ข้อกำหนดระบบ

### Hardware
- RAM: อย่างน้อย 2GB
- Storage: อย่างน้อย 5GB
- CPU: 2 cores ขึ้นไป

### Software
- Docker Desktop 24.0+ หรือ Docker Engine 20.0+
- Docker Compose 2.0+

---

## 🔧 การติดตั้ง Docker

### Windows
1. ดาวน์โหลด [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. ติดตั้งและเปิดใช้งาน WSL 2
3. เปิด Docker Desktop

### macOS
1. ดาวน์โหลด [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. ติดตั้งและเปิดใช้งาน

### Linux (Ubuntu/Debian)
```bash
# อัปเดตแพ็คเกจ
sudo apt update

# ติดตั้ง Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# เพิ่ม user ปัจจุบันเข้า docker group
sudo usermod -aG docker $USER

# ติดตั้ง Docker Compose
sudo apt install docker-compose-plugin
```

---

## 🚀 การรันระบบ

### 1. Clone Project (ถ้ายังไม่มี)
```bash
git clone <repository-url>
cd checkinSys/lab_system
```

### 2. ตรวจสอบไฟล์ที่จำเป็น
ตรวจสอบว่ามีไฟล์ทั้งหมดนี้:
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `entrypoint.sh`
- ✅ `requirements.txt`
- ✅ `nginx.conf`

### 3. Build และรัน Docker Containers

```bash
# Build images และสร้าง containers
docker-compose up --build

# หรือรันแบบ detached mode (background)
docker-compose up -d --build
```

### 4. รอให้ระบบพร้อม
เมื่อรันครั้งแรก ระบบจะ:
1. ⏳ รอให้ MySQL พร้อม (~30 วินาที)
2. 🔨 สร้าง database migrations
3. 🗄️ รัน migrations (สร้างตาราง)
4. 👤 สร้าง superuser อัตโนมัติ:
   - **Username**: `admin`
   - **Password**: `admin123`
5. 📁 Collect static files
6. ✅ เริ่ม Django server

---

## 🌐 การเข้าถึงระบบ

หลังจากรันสำเร็จ สามารถเข้าถึงได้ที่:

### 1. Kiosk (ไม่ต้อง login)
```
http://localhost/?pc_id=PC-01
```

### 2. Admin Panel (ต้อง login)
```
http://localhost/admin/
Username: admin
Password: admin123
```

### 3. Manager Dashboard (ต้อง login ด้วย staff account)
```
http://localhost/manager/dashboard/
```
**หมายเหตุ**: หน้านี้ต้อง login และเป็น staff/admin เท่านั้น

### 4. phpMyAdmin (จัดการ MySQL)
```
http://localhost:8080/
Server: db
Username: labuser
Password: labpassword
```

### 5. Nginx (Reverse Proxy)
```
http://localhost:80/
```
Nginx จะ forward requests ไปยัง Django (port 8000)

---

## 🔐 Authentication

### การป้องกัน Routes

ระบบมี **Custom Middleware** ที่บังคับให้ login สำหรับ:

#### Protected Routes (ต้อง login + staff)
- ✅ `/manager/*` - ทุกหน้าใน Manager
- ✅ `/api/*` - ทุก API endpoints

#### Public Routes (ไม่ต้อง login)
- ✅ `/` - Kiosk main page
- ✅ `/checkin/*` - Check-in pages
- ✅ `/checkout/*` - Check-out pages
- ✅ `/static/*` - Static files
- ✅ `/media/*` - Media files

### การสร้าง Admin User เพิ่ม

```bash
# เข้าไปใน web container
docker-compose exec web bash

# สร้าง superuser
python manage.py createsuperuser

# หรือใช้ Django shell
python manage.py shell

# จากนั้นใน shell:
from django.contrib.auth.models import User
User.objects.create_superuser('myuser', 'myemail@example.com', 'mypassword')
```

### การทำให้ User เป็น Staff

```bash
docker-compose exec web python manage.py shell

# ใน shell:
from django.contrib.auth.models import User
user = User.objects.get(username='someuser')
user.is_staff = True
user.is_superuser = True  # ถ้าต้องการให้เป็น superuser
user.save()
```

---

## 🛠️ การจัดการระบบ

### ดู Logs
```bash
# ดู logs ทั้งหมด
docker-compose logs

# ดู logs แบบ realtime
docker-compose logs -f

# ดู logs เฉพาะ service
docker-compose logs web
docker-compose logs db
docker-compose logs nginx
```

### Stop ระบบ
```bash
# หยุดแต่ยัง keep containers
docker-compose stop

# หยุดและลบ containers (ข้อมูลใน volumes ยังอยู่)
docker-compose down

# หยุดและลบทั้ง containers + volumes (ข้อมูลหายหมด!)
docker-compose down -v
```

### Restart ระบบ
```bash
# Restart ทุก services
docker-compose restart

# Restart service เดียว
docker-compose restart web
```

### รัน Django Commands
```bash
# เข้าไปใน web container
docker-compose exec web bash

# หรือรันคำสั่งตรงๆ
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py shell
```

### Rebuild Images
```bash
# Build ใหม่เมื่อเปลี่ยน Dockerfile หรือ requirements.txt
docker-compose build

# Build และรัน
docker-compose up --build
```

---

## 🗄️ Database Management

### Backup Database
```bash
# Backup MySQL database
docker-compose exec db mysqldump -u labuser -p'labpassword' lab_checkin_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
# Restore from backup
docker-compose exec -T db mysql -u labuser -p'labpassword' lab_checkin_db < backup_20250101_120000.sql
```

### Reset Database
```bash
# ลบ volume และสร้างใหม่
docker-compose down -v
docker-compose up -d
```

### เข้าใช้ MySQL CLI
```bash
docker-compose exec db mysql -u labuser -p'labpassword' lab_checkin_db
```

---

## 📊 Monitoring

### ดูสถานะ Containers
```bash
docker-compose ps
```

### ดูการใช้ Resources
```bash
docker stats
```

### ตรวจสอบ Health
```bash
# MySQL health
docker-compose exec db mysqladmin ping -h localhost -u root -p'rootpassword'

# Django health
curl http://localhost/health/
```

---

## ⚙️ Configuration

### Environment Variables

แก้ไขใน `docker-compose.yml`:

```yaml
environment:
  - DEBUG=False  # Production: False, Development: True
  - SECRET_KEY=your-secret-key-here
  - DB_NAME=lab_checkin_db
  - DB_USER=labuser
  - DB_PASSWORD=labpassword
  - DB_HOST=db
  - DB_PORT=3306
  - ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
```

### MySQL Configuration

แก้ไข MySQL credentials:
```yaml
db:
  environment:
    MYSQL_ROOT_PASSWORD: your-root-password
    MYSQL_DATABASE: lab_checkin_db
    MYSQL_USER: your-username
    MYSQL_PASSWORD: your-password
```

### Nginx Configuration

แก้ไข `nginx.conf` สำหรับ custom domain หรือ SSL

---

## 🐛 Troubleshooting

### 1. MySQL Connection Error
**Problem**: `Can't connect to MySQL server`

**Solution**:
```bash
# ตรวจสอบว่า MySQL container รันอยู่
docker-compose ps

# ดู MySQL logs
docker-compose logs db

# Restart MySQL
docker-compose restart db
```

### 2. Port Already in Use
**Problem**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**:
```bash
# ดู process ที่ใช้ port
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000

# เปลี่ยน port ใน docker-compose.yml
ports:
  - "8001:8000"  # แทน 8000:8000
```

### 3. Permission Denied (entrypoint.sh)
**Problem**: `Permission denied: entrypoint.sh`

**Solution**:
```bash
# ให้สิทธิ์ execute
chmod +x entrypoint.sh

# Rebuild
docker-compose build
```

### 4. Static Files ไม่โหลด
**Problem**: CSS/JS ไม่แสดง

**Solution**:
```bash
# Collect static files ใหม่
docker-compose exec web python manage.py collectstatic --noinput

# Restart nginx
docker-compose restart nginx
```

### 5. Migrations Error
**Problem**: `No such table: core_computer`

**Solution**:
```bash
# ลบ migrations เก่า (ระวัง!)
docker-compose exec web bash
rm core/migrations/0*.py

# สร้างใหม่
python manage.py makemigrations
python manage.py migrate
```

### 6. Memory Issues
**Problem**: Docker uses too much memory

**Solution**:
```bash
# ลบ unused images/containers
docker system prune -a

# จำกัด memory ใน docker-compose.yml
web:
  deploy:
    resources:
      limits:
        memory: 512M
```

---

## 🔒 Security Recommendations

### Production Deployment

1. **เปลี่ยน SECRET_KEY**
```python
# Generate new key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

2. **ตั้ง DEBUG=False**
```yaml
environment:
  - DEBUG=False
```

3. **เปลี่ยนรหัสผ่าน MySQL**
```yaml
MYSQL_ROOT_PASSWORD: <strong-password>
MYSQL_PASSWORD: <strong-password>
```

4. **ตั้ง ALLOWED_HOSTS**
```python
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
```

5. **ใช้ HTTPS (SSL)**
- ติดตั้ง Let's Encrypt
- Config nginx สำหรับ SSL

---

## 📱 การใช้งานจริง

### Workflow ปกติ

1. **เปิดระบบตอนเช้า**
```bash
cd lab_system
docker-compose up -d
```

2. **ตรวจสอบสถานะ**
```bash
docker-compose ps
docker-compose logs -f --tail=100
```

3. **ใช้งานตลอดวัน**
- Kiosk: ผู้ใช้ check-in/out ที่ `http://localhost/?pc_id=PC-XX`
- Admin: ดู dashboard ที่ `http://localhost/manager/dashboard/`

4. **ปิดระบบตอนเย็น**
```bash
docker-compose stop
```

5. **Backup ข้อมูล (ประจำวัน/สัปดาห์)**
```bash
docker-compose exec db mysqldump -u labuser -p'labpassword' lab_checkin_db > backup_daily.sql
```

---

## 📞 Support

ถ้ามีปัญหาหรือคำถาม:
1. ตรวจสอบ logs: `docker-compose logs`
2. ดูที่ Troubleshooting section
3. ติดต่อทีมพัฒนา

---

**เอกสารนี้อัปเดตล่าสุด**: 2025-01-30
