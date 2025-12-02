# 🚀 Quick Start Guide - Lab Check-in System (Docker)

## 📦 ข้อกำหนดเบื้องต้น

- ✅ Docker Desktop ติดตั้งแล้ว
- ✅ Git (optional)

## ⚡ วิธีรันแบบเร็ว (3 ขั้นตอน)

### 1. เปิด Command Prompt / Terminal

```bash
cd e:\FYPrj\checkinSys\lab_system
```

### 2. รันสคริปต์ (เลือกอย่างใดอย่างหนึ่ง)

#### วิธีที่ 1: ใช้สคริปต์ (Windows)
```bash
docker-run.bat
```

#### วิธีที่ 2: รันคำสั่งโดยตรง
```bash
docker-compose up --build -d
```

### 3. เข้าใช้งาน

รอ ~30 วินาที แล้วเปิด browser:

| Service | URL | ข้อมูลเข้าใช้ |
|---------|-----|---------------|
| **Kiosk (PC-01)** | http://localhost/?pc_id=PC-01 | ไม่ต้อง login |
| **Admin Panel** | http://localhost/admin/ | admin / admin123 |
| **Dashboard** | http://localhost/manager/dashboard/ | ต้อง login ด้วย admin |
| **phpMyAdmin** | http://localhost:8080/ | labuser / labpassword |

---

## 🔐 Authentication

### หน้าที่ต้อง Login (Staff Only)
- `/manager/*` - ทุกหน้า Manager
- `/api/*` - ทุก API endpoints

### หน้าที่ไม่ต้อง Login
- `/` - Kiosk
- `/checkin/`, `/checkout/` - Check-in/out pages

### ถ้าไม่ได้ login
- System จะ redirect ไป `/admin/login/`
- ต้อง login ด้วย account ที่เป็น **staff** หรือ **superuser**

---

## 🛠️ คำสั่งพื้นฐาน

### ดู Logs
```bash
docker-compose logs -f
```

### Stop ระบบ
```bash
docker-stop.bat
# หรือ
docker-compose stop
```

### Restart
```bash
docker-compose restart
```

### ลบทุกอย่างและเริ่มใหม่
```bash
docker-compose down -v
docker-compose up --build -d
```

---

## 📊 ตัวอย่างการใช้งาน

### 1. เพิ่มเครื่อง PC
1. Login: http://localhost/admin/
2. ไป: Dashboard → Manage Computers
3. กด "เพิ่มเครื่อง"
4. กรอก PC ID: `PC-02`

### 2. ติดตั้ง Software
1. สร้าง Software ใน Admin Panel ก่อน
2. ไป Manage Computers
3. เลือกเครื่อง → เลือก Software → ติดตั้ง

### 3. Check-in (นักศึกษา)
1. เปิด: http://localhost/?pc_id=PC-01
2. กด "เข้าใช้งาน"
3. เลือก "นักศึกษา"
4. กรอกรหัส: `65310001`
5. ระบบจะดึงข้อมูลจาก API

### 4. Check-out
1. กด "ออกจากระบบ"
2. ให้คะแนน
3. กรอกความคิดเห็น
4. **Log ถูกสร้างเมื่อ checkout**

### 5. ดู Report
1. Login
2. ไป: http://localhost/manager/report/
3. ดู Log ทั้งหมด
4. Export CSV

---

## 🗄️ Database

### ดูข้อมูลใน MySQL
1. เปิด: http://localhost:8080/
2. Login:
   - Server: `db`
   - Username: `labuser`
   - Password: `labpassword`
3. เลือก database: `lab_checkin_db`

### ตารางสำคัญ
- `core_computer` - เครื่อง PC
- `core_status` - สถานะปัจจุบัน (Real-time)
- `core_checkinlog` - ประวัติการใช้งาน (สร้างตอน checkout)
- `core_software` - Software
- `core_reservation` - การจอง

---

## ❗ Troubleshooting

### Port ชน
```bash
# เปลี่ยน port ใน docker-compose.yml
ports:
  - "8001:8000"  # แทน 8000:8000
```

### MySQL ไม่พร้อม
```bash
# รอ 30 วินาที แล้วลองอีกครั้ง
docker-compose restart
```

### Static files ไม่โหลด
```bash
docker-compose exec web python manage.py collectstatic --noinput
docker-compose restart nginx
```

---

## 📚 เอกสารเพิ่มเติม

- 📖 [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - คู่มือฉบับเต็ม
- 📝 [test_checklist.md](test_checklist.md) - ขั้นตอนทดสอบ
- 🔧 [README-Docker.md](README-Docker.md) - Technical details

---

## 🎯 Next Steps

หลังจากรันสำเร็จแล้ว:

1. ✅ เข้า Admin Panel สร้าง Software
2. ✅ เพิ่มเครื่อง PC ใน Manage
3. ✅ ทดสอบ Check-in/out
4. ✅ ดู Dashboard real-time
5. ✅ Export report

---

**Happy Coding! 🎉**
