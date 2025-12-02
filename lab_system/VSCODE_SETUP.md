# 🚀 VSCode Setup Guide - Django Lab System

## ข้อกำหนดเบื้องต้น

- ✅ Python 3.8+ (แนะนำ Python 3.11 หรือ 3.12)
- ✅ Visual Studio Code
- ✅ Git (Optional)

---

## 📦 ติดตั้ง Extensions ที่แนะนำ

VSCode จะแนะนำ extensions อัตโนมัติเมื่อเปิดโปรเจค หรือติดตั้งด้วยตนเอง:

### Extensions ที่จำเป็น:
1. **Python** (ms-python.python) - Python language support
2. **Pylance** (ms-python.vscode-pylance) - Fast Python IntelliSense
3. **Python Debugger** (ms-python.debugpy) - Debugging support

### Extensions ที่แนะนำ:
4. **Django** (batisteo.vscode-django) - Django template support
5. **Jinja** (wholroyd.jinja) - Template syntax highlighting
6. **Docker** (ms-azuretools.vscode-docker) - Docker support
7. **Auto Rename Tag** - HTML tag auto-rename
8. **Auto Close Tag** - HTML tag auto-close

---

## 🔧 Setup ขั้นตอนที่ 1: สร้าง Virtual Environment

### วิธีที่ 1: ใช้ Script (แนะนำ - ง่ายที่สุด)

```bash
# Double-click หรือรันใน Terminal
setup-venv.bat
```

Script จะทำอัตโนมัติ:
1. สร้าง virtual environment
2. Activate environment
3. Upgrade pip
4. Install dependencies จาก requirements.txt

---

### วิธีที่ 2: Manual Setup

```bash
# 1. สร้าง Virtual Environment
python -m venv venv

# 2. Activate (Windows)
venv\Scripts\activate

# 3. Upgrade pip
python -m pip install --upgrade pip

# 4. Install Requirements
pip install -r requirements.txt
```

---

## 🎯 Setup ขั้นตอนที่ 2: เลือก Python Interpreter ใน VSCode

1. กด `Ctrl + Shift + P`
2. พิมพ์: `Python: Select Interpreter`
3. เลือก: `.\venv\Scripts\python.exe`

หรือ VSCode จะแนะนำอัตโนมัติเมื่อเปิด .py file

---

## ▶️ วิธีรัน Django Server

### วิธีที่ 1: ใช้ Debug Menu (แนะนำ)

1. กด `F5` หรือไปที่ **Run and Debug** (Ctrl+Shift+D)
2. เลือก configuration:
   - **Django: Run Server** - รันด้วย default settings
   - **Django: Run Server (SQLite)** - รันด้วย SQLite database
   - **Django: Run Server (MySQL)** - รันด้วย MySQL (ต้องมี MySQL server)

3. Server จะรันที่ http://localhost:8000

---

### วิธีที่ 2: ใช้ Terminal

```bash
# Activate venv ก่อน
venv\Scripts\activate

# Run server
python manage.py runserver

# Run server บน port อื่น
python manage.py runserver 0.0.0.0:8080
```

---

### วิธีที่ 3: ใช้ Tasks (Ctrl+Shift+B)

1. กด `Ctrl + Shift + P`
2. พิมพ์: `Tasks: Run Task`
3. เลือก: `Django: Run Server`

---

## 🗄️ Database Setup

### SQLite (Default - ไม่ต้องติดตั้งอะไร)

```bash
# Activate venv
venv\Scripts\activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

---

### MySQL (สำหรับ Production)

**Prerequisites:**
- MySQL Server 8.0+
- mysqlclient library (already in requirements.txt)

**Setup:**

```bash
# 1. สร้าง database
mysql -u root -p
CREATE DATABASE lab_checkin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'labuser'@'localhost' IDENTIFIED BY 'labpassword';
GRANT ALL PRIVILEGES ON lab_checkin_db.* TO 'labuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 2. Set environment variables (Windows)
set DB_ENGINE=mysql
set DB_NAME=lab_checkin_db
set DB_USER=labuser
set DB_PASSWORD=labpassword
set DB_HOST=localhost
set DB_PORT=3306

# 3. Run migrations
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser
```

หรือใช้ launch configuration: **Django: Run Server (MySQL)**

---

## 🐛 Debugging

### Set Breakpoints

1. คลิกที่หมายเลขบรรทัดใน code editor
2. จุดสีแดงจะปรากฏ (breakpoint)
3. กด `F5` เพื่อเริ่ม debug
4. Server จะหยุดที่ breakpoint และให้คุณตรวจสอบ variables

### Debug Toolbar

ตัวแปรที่ตรวจสอบได้:
- **Variables** - ตัวแปรทั้งหมดใน scope ปัจจุบัน
- **Watch** - ติดตามตัวแปรเฉพาะ
- **Call Stack** - ดู function call hierarchy
- **Breakpoints** - จัดการ breakpoints ทั้งหมด

---

## 🔨 Django Management Commands

### ผ่าน VSCode Tasks (Ctrl+Shift+P → Tasks: Run Task)

- `Django: Make Migrations` - สร้าง migration files
- `Django: Migrate` - Apply migrations
- `Django: Create Superuser` - สร้าง admin user
- `Django: Collect Static` - Collect static files
- `Django: Shell` - เปิด Django shell

---

### ผ่าน Terminal

```bash
# Activate venv
venv\Scripts\activate

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Open Django shell
python manage.py shell

# Show all commands
python manage.py help
```

---

## 🐳 Docker Support (Optional)

### ผ่าน VSCode Tasks

- `Docker: Build and Run` - Build และรัน containers
- `Docker: Stop` - หยุด containers
- `Docker: Restart` - Restart containers
- `Docker: Logs` - ดู logs

---

### ผ่าน Terminal

```bash
# Build and run
docker-compose up --build -d

# Stop
docker-compose stop

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Stop and remove
docker-compose down
```

---

## 📁 โครงสร้างโปรเจค

```
lab_system/
├── .vscode/                    # VSCode configuration
│   ├── settings.json          # Editor settings
│   ├── launch.json            # Debug configurations
│   ├── tasks.json             # Task definitions
│   └── extensions.json        # Recommended extensions
├── core/                       # Main Django app
│   ├── models.py              # Database models
│   ├── views.py               # View functions
│   ├── urls.py                # URL routing
│   └── middleware.py          # Custom middleware
├── lab_system/                 # Project settings
│   ├── settings.py            # Django settings
│   ├── urls.py                # Root URL config
│   └── wsgi.py                # WSGI config
├── templates/                  # HTML templates
├── static/                     # Static files (CSS, JS, images)
├── venv/                      # Virtual environment (created by setup)
├── manage.py                   # Django management script
├── requirements.txt            # Python dependencies
├── setup-venv.bat             # Setup script
└── docker-compose.yml         # Docker configuration
```

---

## ⚙️ VSCode Settings

### Keyboard Shortcuts

- `F5` - Start Debugging (Run server)
- `Ctrl + Shift + D` - Open Debug view
- `Ctrl + Shift + P` - Command Palette
- `Ctrl + Shift + B` - Run Build Task
- `Ctrl + Shift + `\` - Open Terminal
- `Ctrl + .` - Quick Fix

### Useful Commands

- `Python: Select Interpreter` - เลือก Python interpreter
- `Python: Create Terminal` - สร้าง terminal พร้อม activate venv
- `Tasks: Run Task` - รัน task จาก tasks.json
- `Debug: Start Debugging` - เริ่ม debug session

---

## 🧪 Testing

### Run Tests ใน VSCode

1. กด `F5`
2. เลือก: `Django: Test`

### Run Tests ใน Terminal

```bash
# Activate venv
venv\Scripts\activate

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test core

# Run specific test
python manage.py test core.tests.TestViews.test_index
```

---

## 🔍 Troubleshooting

### ปัญหา: Import Error / Module Not Found

**แก้ไข:**
1. ตรวจสอบว่า venv ถูก activate แล้ว
2. ตรวจสอบ Python Interpreter: Ctrl+Shift+P → `Python: Select Interpreter`
3. Reinstall dependencies: `pip install -r requirements.txt`

---

### ปัญหา: Database Error

**แก้ไข:**
```bash
# ลบ database และสร้างใหม่
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

### ปัญหา: Port Already in Use

**แก้ไข:**
```bash
# หา process ที่ใช้ port 8000
netstat -ano | findstr :8000

# Kill process (ใช้ PID จากคำสั่งก่อนหน้า)
taskkill /PID <PID> /F

# หรือรันบน port อื่น
python manage.py runserver 8080
```

---

### ปัญหา: Static Files ไม่โหลด

**แก้ไข:**
```bash
# Collect static files
python manage.py collectstatic --noinput

# หรือตั้งค่า DEBUG = True ใน settings.py (development only)
```

---

## 📚 Resources

### Official Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [VSCode Python Tutorial](https://code.visualstudio.com/docs/python/python-tutorial)
- [VSCode Django Tutorial](https://code.visualstudio.com/docs/python/tutorial-django)

### Project Documentation
- [QUICK_START.md](QUICK_START.md) - Quick start with Docker
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Docker deployment guide
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Authentication system
- [CHECKIN_UPDATE.md](CHECKIN_UPDATE.md) - Check-in system updates

---

## 🎯 Quick Start Checklist

- [ ] ติดตั้ง Python 3.8+
- [ ] ติดตั้ง VSCode
- [ ] Clone/Download project
- [ ] รัน `setup-venv.bat`
- [ ] เลือก Python Interpreter ใน VSCode (venv)
- [ ] ติดตั้ง recommended extensions
- [ ] รัน migrations: `python manage.py migrate`
- [ ] สร้าง superuser: `python manage.py createsuperuser`
- [ ] กด `F5` เพื่อ run server
- [ ] เปิด http://localhost:8000

---

**Happy Coding! 🎉**

**Last Updated**: 2025-11-30
