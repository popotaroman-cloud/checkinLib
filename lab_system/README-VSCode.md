# 🔧 VSCode Development Setup - Quick Reference

## ⚡ Quick Start (3 Steps)

### 1. Setup Virtual Environment
```bash
# Windows
setup-venv.bat

# หรือ Manual
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Select Python Interpreter
- กด `Ctrl + Shift + P`
- พิมพ์: `Python: Select Interpreter`
- เลือก: `.\venv\Scripts\python.exe`

### 3. Run Server
- กด `F5`
- เลือก: `Django: Run Server`
- เปิด: http://localhost:8000

---

## 📦 Files Created

```
.vscode/
├── settings.json       # VSCode editor settings
├── launch.json         # Debug configurations (F5)
├── tasks.json          # Tasks (Ctrl+Shift+B)
└── extensions.json     # Recommended extensions

setup-venv.bat          # Auto setup script
.env.example            # Environment variables template
VSCODE_SETUP.md        # Full documentation
```

---

## 🎯 Debug Configurations (F5)

1. **Django: Run Server** - รัน Django development server
2. **Django: Run Server (SQLite)** - รันด้วย SQLite database
3. **Django: Run Server (MySQL)** - รันด้วย MySQL database
4. **Django: Test** - รัน tests
5. **Django: Shell** - เปิด Django shell
6. **Django: Migrate** - รัน migrations
7. **Django: Make Migrations** - สร้าง migration files

---

## ⚙️ Tasks (Ctrl+Shift+P → Tasks: Run Task)

### Django Tasks
- `Django: Run Server`
- `Django: Make Migrations`
- `Django: Migrate`
- `Django: Create Superuser`
- `Django: Collect Static`
- `Django: Shell`

### Development Tasks
- `Install Requirements` - ติดตั้ง Python packages

### Docker Tasks
- `Docker: Build and Run`
- `Docker: Stop`
- `Docker: Restart`
- `Docker: Logs`

---

## 🔌 Recommended Extensions

VSCode จะแนะนำให้ติดตั้งเมื่อเปิดโปรเจค:

**ที่จำเป็น:**
- Python
- Pylance
- Python Debugger

**ที่แนะนำ:**
- Django
- Jinja
- Docker
- Auto Rename Tag
- Auto Close Tag

---

## 📝 Common Commands

### Terminal Commands
```bash
# Activate venv
venv\Scripts\activate

# Run server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### VSCode Shortcuts
- `F5` - Start Debugging
- `Ctrl + Shift + D` - Debug view
- `Ctrl + Shift + P` - Command Palette
- `Ctrl + Shift + B` - Run Build Task
- `Ctrl + Shift + `` - Terminal

---

## 🐛 Debugging Features

### Breakpoints
1. คลิกที่หมายเลขบรรทัด → จุดแดงปรากฏ
2. กด `F5` → Server หยุดที่ breakpoint
3. ตรวจสอบ variables, call stack, etc.

### Debug Console
- ดู output logs
- Evaluate expressions
- Interactive Python shell

---

## 🗄️ Database Options

### SQLite (Default)
```bash
# ไม่ต้องติดตั้งอะไร
python manage.py migrate
```

### MySQL
```bash
# ตั้งค่า environment variables
set DB_ENGINE=mysql
set DB_NAME=lab_checkin_db
set DB_USER=labuser
set DB_PASSWORD=labpassword

# Run
python manage.py migrate
```

หรือใช้ launch config: `Django: Run Server (MySQL)`

---

## 📚 Full Documentation

อ่านเพิ่มเติมที่: [VSCODE_SETUP.md](VSCODE_SETUP.md)

### Related Guides
- [QUICK_START.md](QUICK_START.md) - Docker quick start
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Docker deployment
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Authentication
- [CHECKIN_UPDATE.md](CHECKIN_UPDATE.md) - Check-in system

---

## ❓ Troubleshooting

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Run on different port
python manage.py runserver 8080
```

### Static Files Not Loading
```bash
python manage.py collectstatic
```

---

## ✅ Setup Checklist

- [ ] Python 3.8+ installed
- [ ] VSCode installed
- [ ] Ran `setup-venv.bat`
- [ ] Selected Python interpreter (venv)
- [ ] Installed extensions
- [ ] Ran migrations
- [ ] Created superuser
- [ ] Tested F5 debug

---

**Ready to Code! 🚀**
