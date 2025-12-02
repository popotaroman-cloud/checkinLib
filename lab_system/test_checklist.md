# Test Checklist - Lab Check-in System

## การทดสอบหลังจาก Migration

### 1. ตรวจสอบ Database Structure ✓
- [ ] เปิด Django shell: `python manage.py shell`
- [ ] ทดสอบคำสั่ง:
```python
from core.models import Computer, Status, CheckInLog, Reservation, Software

# ตรวจสอบว่า Status model มี relationship กับ Computer
pc = Computer.objects.first()
print(pc.status_info)  # ต้องแสดง Status object

# ตรวจสอบ fields
print(Status._meta.get_fields())
```

### 2. ทดสอบการเพิ่มเครื่อง (Add Computer) ✓
- [ ] เข้า Dashboard: `http://127.0.0.1:8000/manager/dashboard/`
- [ ] ไปที่ Manage Computers
- [ ] กดปุ่ม "เพิ่มเครื่อง"
- [ ] กรอก PC ID: `PC-01`
- [ ] เลือกสถานะ: `ว่าง (Available)`
- [ ] กดบันทึก
- [ ] **ผลที่คาดหวัง**: เครื่องถูกสร้างและมี Status record ด้วย

### 3. ทดสอบติดตั้ง Software ✓
- [ ] สร้าง Software ก่อน:
  - ไปที่ Admin: `http://127.0.0.1:8000/admin/core/software/`
  - เพิ่ม Software: `Adobe Photoshop`, version: `2024`
- [ ] กลับไปหน้า Manage
- [ ] เลือกเครื่อง: `PC-01`
- [ ] เลือก Software: `Adobe Photoshop`
- [ ] กดติดตั้ง
- [ ] **ผลที่คาดหวัง**: Status.software ถูกอัปเดต

### 4. ทดสอบ Check-in Flow (นักศึกษา) ✓
- [ ] เปิด: `http://127.0.0.1:8000/?pc_id=PC-01`
- [ ] กด "เข้าใช้งาน"
- [ ] เลือกประเภท: `นักศึกษา`
- [ ] กรอกรหัสนักศึกษา: `65310001`
- [ ] กด Check-in
- [ ] **ผลที่คาดหวัง**:
  - Status.status = `in_use`
  - Status.current_user_name = ชื่อจาก API
  - Status.start_time = เวลาปัจจุบัน
  - **ไม่มี CheckInLog ถูกสร้าง**

### 5. ตรวจสอบ Dashboard Real-time ✓
- [ ] เปิด Dashboard: `http://127.0.0.1:8000/manager/dashboard/`
- [ ] **ผลที่คาดหวัง**:
  - เครื่อง PC-01 แสดงสถานะ "ใช้งาน" (สีแดง)
  - แสดงชื่อผู้ใช้
  - แสดงเวลาเริ่มใช้งาน
  - Stats: Occupied = 1

### 6. ทดสอบ Check-out Flow (ปกติ) ✓
- [ ] กลับไปที่: `http://127.0.0.1:8000/?pc_id=PC-01`
- [ ] กด "ออกจากระบบ"
- [ ] ให้คะแนน: 5 ดาว
- [ ] กรอกความคิดเห็น: "ดีมาก"
- [ ] กด Check-out
- [ ] **ผลที่คาดหวัง**:
  - **CheckInLog ถูกสร้าง** พร้อมข้อมูลครบถ้วน
  - Status.status = `available`
  - Status ทุก field ถูก reset (null)
  - duration_minutes ถูกคำนวณถูกต้อง

### 7. ตรวจสอบ Log ใน Database ✓
- [ ] เปิด Admin: `http://127.0.0.1:8000/admin/core/checkinlog/`
- [ ] **ผลที่คาดหวัง**:
  - มี 1 record
  - pc = `PC-01` (CharField)
  - user_name = ชื่อผู้ใช้
  - checkin_time, checkout_time มีค่า
  - duration_minutes > 0
  - rating = 5
  - comment = "ดีมาก"

### 8. ทดสอบ Force Checkout (Admin) ✓
- [ ] Check-in อีกครั้งที่ PC-01
- [ ] ไปที่ Dashboard
- [ ] คลิกที่เครื่อง PC-01 (สถานะแดง)
- [ ] กด "ปิดเครื่อง"
- [ ] **ผลที่คาดหวัง**:
  - CheckInLog ถูกสร้าง (rating = 3, comment = "Force checkout by admin")
  - Status.status = `disabled`
  - Status ถูก reset

### 9. ทดสอบ Export CSV ✓
- [ ] ไปที่ Report: `http://127.0.0.1:8000/manager/report/`
- [ ] กด "Export CSV"
- [ ] เปิดไฟล์ CSV
- [ ] **ผลที่คาดหวัง**:
  - PC ID แสดงเป็น string (ไม่ใช่ object)
  - ข้อมูลครบถ้วน
  - Duration แสดงเป็นทั้งนาทีและ HH:MM

### 10. ทดสอบ Check-in (Staff) ✓
- [ ] เปิดเครื่อง PC-01 (ถ้าปิดอยู่)
- [ ] เข้าใช้งานแบบ Staff
- [ ] กรอกรหัสบุคลากร: `S001`
- [ ] **ผลที่คาดหวัง**:
  - Status.current_user_type = `staff`
  - Status.faculty มีค่า

### 11. ทดสอบ Check-in (External) ✓
- [ ] เปิดเครื่อง PC-01
- [ ] เข้าใช้งานแบบ บุคคลภายนอก
- [ ] กรอก:
  - เลขบัตรประชาชน: `1234567890123`
  - ชื่อ-นามสกุล: `สมชาย ทดสอบ`
  - หน่วยงาน: `บริษัท ABC`
- [ ] **ผลที่คาดหวัง**:
  - Status.current_user_type = `external`
  - Status.organization = `บริษัท ABC`

### 12. ทดสอบ Multiple PCs ✓
- [ ] เพิ่มเครื่อง PC-02, PC-03
- [ ] Check-in ที่ PC-02
- [ ] Check-in ที่ PC-03
- [ ] เปิด Dashboard
- [ ] **ผลที่คาดหวัง**:
  - แสดงเครื่องทั้ง 3 เครื่อง
  - Stats: Total = 3, Occupied = 2, Available = 1

### 13. ทดสอบ Update Computer ✓
- [ ] ไปที่ Manage
- [ ] แก้ไขเครื่อง PC-01 (ที่กำลังใช้งาน)
- [ ] เปลี่ยนสถานะเป็น Available
- [ ] **ผลที่คาดหวัง**:
  - แสดง Confirmation dialog
  - กด Confirm
  - CheckInLog ถูกสร้าง (force checkout)
  - Status เปลี่ยนเป็น available

### 14. ตรวจสอบ Model Consistency ✓
```python
# เข้า Django shell
from core.models import Computer, Status, CheckInLog

# ตรวจสอบ Computer ทุกเครื่องมี Status
for pc in Computer.objects.all():
    assert hasattr(pc, 'status_info'), f"{pc.pc_id} ไม่มี Status"
    print(f"{pc.pc_id}: {pc.status_info.status}")

# ตรวจสอบ CheckInLog ทุก record มี CharField pc
for log in CheckInLog.objects.all():
    assert isinstance(log.pc, str), f"Log {log.id} pc ไม่ใช่ string"
    print(f"Log {log.id}: PC={log.pc}, Duration={log.duration_minutes} min")
```

---

## สรุปผลการทดสอบ

| Test Case | Status | หมายเหตุ |
|-----------|--------|----------|
| 1. Database Structure | ⬜ | |
| 2. Add Computer | ⬜ | |
| 3. Install Software | ⬜ | |
| 4. Check-in (Student) | ⬜ | |
| 5. Dashboard Real-time | ⬜ | |
| 6. Check-out (Normal) | ⬜ | |
| 7. Log Verification | ⬜ | |
| 8. Force Checkout | ⬜ | |
| 9. Export CSV | ⬜ | |
| 10. Check-in (Staff) | ⬜ | |
| 11. Check-in (External) | ⬜ | |
| 12. Multiple PCs | ⬜ | |
| 13. Update Computer | ⬜ | |
| 14. Model Consistency | ⬜ | |

---

## Expected Database Schema

### Computer
```
pc_id (PK, CharField)
ip_address (GenericIPAddressField, nullable)
```

### Status (OneToOne with Computer)
```
computer (FK to Computer, PK)
software (CharField, nullable)
status (CharField: available/in_use/disabled)
current_user_type (CharField, nullable)
current_user_id (CharField, nullable)
current_user_name (CharField, nullable)
faculty (CharField, nullable)
year_level (IntegerField, nullable)
education_level (CharField, nullable)
organization (CharField, nullable)
start_time (DateTimeField, nullable)
```

### CheckInLog
```
id (PK, AutoField)
pc (CharField) <- NOT FK
installed_sw (TextField)
user_type (CharField)
user_id (CharField)
user_name (CharField)
faculty (CharField, nullable)
year_level (IntegerField, nullable)
education_level (CharField, nullable)
organization (CharField, nullable)
checkin_time (DateTimeField) <- NOT auto_now_add
checkout_time (DateTimeField, nullable)
duration_minutes (IntegerField)
rating (IntegerField)
comment (TextField)
```

### Reservation
```
id (PK, AutoField)
student_id (CharField)
pc (CharField) <- NOT FK
software (CharField, nullable) <- NOT FK
booking_date (DateField)
start_time (TimeField)
end_time (TimeField)
```
