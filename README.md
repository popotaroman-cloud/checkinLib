# Computer Lab Check-in System

ระบบเช็คอินคอมพิวเตอร์สำหรับห้องปฏิบัติการคอมพิวเตอร์

## 🚀 Demo

**Live Demo:** [https://popotaroman-cloud.github.io/checkinLib/prototype/user/idle.html](https://popotaroman-cloud.github.io/checkinLib/prototype/user/idle.html)

### User Pages
- [Idle Screen](https://popotaroman-cloud.github.io/checkinLib/prototype/user/idle.html?pc=PC-001) - หน้าจอรอใช้งาน
- [Select User Type](https://popotaroman-cloud.github.io/checkinLib/prototype/user/select-type.html?pc=PC-001) - เลือกประเภทผู้ใช้
- [Internal Login](https://popotaroman-cloud.github.io/checkinLib/prototype/user/login-internal.html?pc=PC-001) - เข้าสู่ระบบนักศึกษา/บุคลากร
- [External Login](https://popotaroman-cloud.github.io/checkinLib/prototype/user/login-external.html?pc=PC-001) - เข้าสู่ระบบบุคคลภายนอก

### Admin Pages
- [Dashboard](https://popotaroman-cloud.github.io/checkinLib/prototype/admin/dashboard.html) - ภาพรวมระบบ
- [Monitor](https://popotaroman-cloud.github.io/checkinLib/prototype/admin/monitor.html) - ติดตามการใช้งาน
- [Manage PC](https://popotaroman-cloud.github.io/checkinLib/prototype/admin/manage-pc.html) - จัดการเครื่องคอมพิวเตอร์
- [Software](https://popotaroman-cloud.github.io/checkinLib/prototype/admin/manage-software.html) - จัดการซอฟต์แวร์
- [Import Reservation](https://popotaroman-cloud.github.io/checkinLib/prototype/admin/import-reservation.html) - นำเข้าการจอง
- [Reports](https://popotaroman-cloud.github.io/checkinLib/prototype/admin/reports.html) - รายงานและสถิติ

## 📋 Features

### User Features
- ✅ Check-in ด้วย Student ID (นักศึกษา/บุคลากร)
- ✅ Check-in สำหรับบุคคลภายนอก (ใช้บัตรประชาชน)
- ✅ ระบบจับเวลาการใช้งานแบบ Real-time
- ✅ ให้คะแนนความพึงพอใจ (5 ดาว)
- ✅ Mobile-first Responsive Design

### Admin Features
- ✅ Dashboard แสดงภาพรวมการใช้งาน
- ✅ Monitor แบบ Map View และ Table View
- ✅ จัดการเครื่อง PC (CRUD operations)
- ✅ จัดการซอฟต์แวร์
- ✅ Import การจองจาก CSV
- ✅ รายงานและกราฟสถิติ (Plotly.js)
- ✅ Export ข้อมูลเป็น CSV
- ✅ Backup/Restore ข้อมูล

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Plotly.js
- **Storage:** LocalStorage
- **Design:** Mobile-first Responsive Design
- **No Backend Required** - Pure Client-side Application

## 📊 Mock Data

ระบบมี Mock Data พร้อมใช้งาน:
- 30 นักศึกษา (5 คณะ)
- 15 บุคคลภายนอก
- 30 เครื่องคอมพิวเตอร์ (6 แถว A-F)
- 20 การจอง
- 100+ Usage Logs (7 วันย้อนหลัง)
- 15 ซอฟต์แวร์

## 🧪 Test Credentials

### นักศึกษา (Internal Users)
- Student ID: `6501001` - สมชาย ใจดี (คณะวิทยาศาสตร์)
- Student ID: `6501007` - กรกฎ แสงจันทร์ (คณะวิศวกรรมศาสตร์)
- Student ID: `6501013` - ปรียา สุขสันต์ (คณะครุศาสตร์)

### บุคคลภายนอก (External Users)
- กรอกข้อมูลใหม่ได้เลย (ตัวอย่างเลขบัตรประชาชน: `1234567890123`)

## 📁 Project Structure

```
checkinLib/
├── diagram/                    # PlantUML Diagrams
│   ├── usecase-diagram.puml
│   ├── ui state diagram.puml
│   └── activity *.puml
├── prototype/
│   ├── user/                  # User Pages (Mobile-first)
│   │   ├── idle.html
│   │   ├── select-type.html
│   │   ├── login-internal.html
│   │   ├── login-external.html
│   │   ├── active-session.html
│   │   └── feedback.html
│   ├── admin/                 # Admin Pages (Desktop)
│   │   ├── dashboard.html
│   │   ├── monitor.html
│   │   ├── manage-pc.html
│   │   ├── manage-software.html
│   │   ├── import-reservation.html
│   │   └── reports.html
│   ├── css/
│   │   ├── common.css        # Shared styles
│   │   ├── user.css          # User page styles
│   │   └── admin.css         # Admin page styles
│   └── js/
│       ├── config.js         # Mock data & configuration
│       ├── utils.js          # Utility functions
│       └── admin-dashboard.js # Admin functions
└── README.md
```

## 🚀 Local Development

1. Clone repository:
```bash
git clone https://github.com/popotaroman-cloud/checkinLib.git
cd checkinLib
```

2. Open in browser:
```bash
# For User pages
open prototype/user/idle.html

# For Admin pages
open prototype/admin/dashboard.html
```

หรือใช้ Live Server extension ใน VS Code

## 📖 Documentation

### Use Case Diagram
ดูได้ที่ `diagram/usecase-diagram.puml`

### Activity Diagrams
- Check-in Process: `diagram/Activity checkin.puml`
- Check-out Process: `diagram/activity checkout.puml`
- Import Reservation: `diagram/activity import reservation.puml`
- Monitor: `diagram/activity mornitor.puml`
- Reports: `diagram/activity report.puml`

### UI State Diagram
ดูได้ที่ `diagram/ui state diagram.puml`

## 🔧 Configuration

แก้ไขได้ที่ `prototype/js/config.js`:
- `MAX_SESSION_TIME`: เวลาใช้งานสูงสุด (นาที)
- `WARNING_TIME`: เวลาเตือนก่อนหมดเวลา (นาที)
- Mock Data: students, computers, software, etc.

## 📝 License

This is a prototype project for educational purposes.

## 👨‍💻 Author

Created with ❤️ for Computer Lab Management
