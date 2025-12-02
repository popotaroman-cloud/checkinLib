# 📝 Check-in System Update - Internal/External Classification

## สรุปการเปลี่ยนแปลง

แก้ไขระบบ Check-in ให้แยกเป็น **2 ประเภท** แทนที่จะเป็น 3 ประเภท:

### เดิม (3 ประเภท):
- ✅ นักศึกษา (Student)
- ✅ บุคลากร (Staff)
- ✅ บุคคลภายนอก (External)

### ใหม่ (2 ประเภท):
- ✅ **Internal** - นักศึกษา / บุคลากร UBU (ดึงข้อมูลจาก reg_api)
- ✅ **External** - บุคคลภายนอก (กรอกข้อมูลเอง)

---

## 🔄 การทำงานของระบบใหม่

### 1. Internal (นักศึกษา/บุคลากร)

```
ผู้ใช้กรอก: รหัสนักศึกษา หรือ รหัสบุคลากร
         ↓
    เรียก reg_api(user_id)
         ↓
    ตรวจสอบ STUDENTYEAR
         ↓
┌────────────────────────┐
│ STUDENTYEAR > 0        │ → นักศึกษา (Student)
│                        │   - เก็บ year_level
│                        │   - เก็บ education_level
│                        │   - ตรวจสอบการจอง (optional)
└────────────────────────┘

┌────────────────────────┐
│ STUDENTYEAR = 0        │ → บุคลากร (Staff)
│ หรือไม่มี              │   - ไม่เก็บ year_level
│                        │   - ไม่เก็บ education_level
└────────────────────────┘
```

### 2. External (บุคคลภายนอก)

```
ผู้ใช้กรอกข้อมูลเอง:
- เลขบัตรประชาชน
- ชื่อ-นามสกุล
- หน่วยงาน
```

---

## 📄 ไฟล์ที่แก้ไข

### 1. [templates/checkin.html](templates/checkin.html)

**เปลี่ยนจาก 3 tabs → 2 tabs**

```html
<!-- เดิม -->
<button class="tab-btn active" onclick="openTab('student')">นักศึกษา</button>
<button class="tab-btn" onclick="openTab('staff')">เจ้าหน้าที่</button>
<button class="tab-btn" onclick="openTab('external')">บุคคลภายนอก</button>

<!-- ใหม่ -->
<button class="tab-btn active" onclick="openTab('internal')">นักศึกษา / บุคลากร</button>
<button class="tab-btn" onclick="openTab('external')">บุคคลภายนอก</button>
```

**Form สำหรับ Internal**

```html
<div id="internal-tab" class="form-section">
    <form method="POST" action="{% url 'checkin' pc.pc_id %}">
        {% csrf_token %}
        <input type="hidden" name="user_type" value="internal">

        <div class="form-group">
            <label class="form-label">รหัสนักศึกษา / รหัสบุคลากร</label>
            <input type="text" name="user_id" class="form-control"
                   placeholder="เช่น 6601xxxx หรือรหัสพนักงาน" required autofocus>
            <small>*ระบบจะดึงข้อมูลจาก UBU API และแยกประเภทให้อัตโนมัติ</small>
        </div>

        <button type="submit" class="btn btn-primary btn-lg">
            <i class="fas fa-sign-in-alt"></i> ยืนยันเข้าใช้งาน
        </button>
    </form>
</div>
```

---

### 2. [core/views.py](core/views.py)

#### 2.1 อัปเดต `reg_api()` function

```python
def reg_api(user_id):
    """
    เรียก API ดึงข้อมูลนักศึกษา/บุคลากรจาก UBU Reg API
    - ถ้า STUDENTYEAR > 0 = นักศึกษา
    - ถ้า STUDENTYEAR = 0 หรือไม่มี = บุคลากร
    """
    # เข้ารหัส user_id เป็น base64
    encoded_id = base64.b64encode(user_id.encode()).decode()

    # เรียก API
    url = "https://esapi.ubu.ac.th/api/v1/student/reg-data"
    payload = json.dumps({"loginName": encoded_id})
    headers = {'Content-Type': 'application/json'}

    response = requests.post(url, headers=headers, data=payload, timeout=10)
    result = response.json()

    if result.get('statusCode') == 200 and 'data' in result:
        data = result['data']

        return {
            'success': True,
            'name': f"{data.get('USERPREFIXNAME', '')} {data.get('USERNAME', '')} {data.get('USERSURNAME', '')}".strip(),
            'faculty': data.get('FACULTYNAME', 'ไม่ระบุคณะ'),
            'year': data.get('STUDENTYEAR', 0),  # สำคัญ! ใช้เช็คประเภท
            'level': 'ปริญญาตรี',
            'department': data.get('DEPARTMENTNAME', ''),
        }
    # ... error handling
```

#### 2.2 อัปเดต `checkin()` view ([views.py:157-227](core/views.py#L157-L227))

```python
if request.method == 'POST':
    user_type = request.POST.get('user_type')

    # ตัวแปรสำหรับบันทึก
    user_id = ""
    user_name = ""
    faculty_val = None
    year_val = None
    edu_level_val = None
    org_val = None
    final_user_type = user_type  # จะถูกแก้ไขภายหลังถ้าเป็น internal

    # --- Logic แยกตามประเภทผู้ใช้ ---
    if user_type == 'internal':
        # นักศึกษา หรือ บุคลากร (ดึงข้อมูลจาก reg_api)
        internal_id = request.POST.get('user_id')

        # 1. ดึงข้อมูลจาก Reg API
        info = reg_api(internal_id)

        # 2. ตรวจสอบว่า API ส่งข้อมูลกลับมาหรือไม่
        if not info.get('success'):
            messages.error(request, f"ไม่สามารถเข้าใช้งานได้: {info.get('error')}")
            return redirect('checkin', pc_id=pc_id)

        # 3. แยกประเภทตาม year: ถ้า year > 0 = นักศึกษา, ไม่เช่นนั้น = บุคลากร
        year = info.get('year', 0)

        user_id = internal_id
        user_name = info['name']
        faculty_val = info.get('faculty')

        if year and year > 0:
            # นักศึกษา
            final_user_type = 'student'
            year_val = year
            edu_level_val = info.get('level', 'ปริญญาตรี')

            # ตรวจสอบการจอง (เฉพาะนักศึกษา)
            if not check_reservation(internal_id, pc_id):
                messages.warning(request, "คุณไม่ได้จองใช้งานในช่วงเวลานี้ (ข้ามการตรวจสอบได้)")
        else:
            # บุคลากร
            final_user_type = 'staff'
            year_val = None
            edu_level_val = None

    elif user_type == 'external':
        # บุคคลภายนอก
        user_id = request.POST.get('id_card')
        user_name = request.POST.get('full_name')
        org_val = request.POST.get('organization')
        final_user_type = 'external'

    # --- อัปเดต Status (ไม่สร้าง Log) ---
    status = pc.status_info
    status.status = 'in_use'
    status.current_user_type = final_user_type  # ใช้ final_user_type แทน user_type
    status.current_user_id = user_id
    status.current_user_name = user_name
    status.faculty = faculty_val
    status.year_level = year_val
    status.education_level = edu_level_val
    status.organization = org_val
    status.start_time = timezone.now()
    status.save()

    messages.success(request, f"ยินดีต้อนรับ: {user_name}")
    return redirect(f"/?pc_id={pc_id}")
```

#### 2.3 ลบฟังก์ชันที่ไม่ใช้แล้ว

- ❌ ลบ `mock_hr_api_staff()` (ไม่ใช้แล้ว เพราะใช้ reg_api สำหรับทั้งนักศึกษาและบุคลากร)

#### 2.4 เพิ่มฟังก์ชันที่หายไป

- ✅ เพิ่ม `manage()` function กลับมา ([views.py:619-626](core/views.py#L619-L626))

---

## 🧪 การทดสอบ

### Test Case 1: นักศึกษา

```
Input: 65310001
API Response: { STUDENTYEAR: 3, ... }
Expected:
  - final_user_type = 'student'
  - year_val = 3
  - education_level = 'ปริญญาตรี'
```

### Test Case 2: บุคลากร

```
Input: teacher001
API Response: { STUDENTYEAR: 0, ... }
Expected:
  - final_user_type = 'staff'
  - year_val = None
  - education_level = None
```

### Test Case 3: บุคคลภายนอก

```
Input Form:
  - id_card: 1234567890123
  - full_name: นายทดสอบ ระบบ
  - organization: บริษัท ABC
Expected:
  - final_user_type = 'external'
  - organization = 'บริษัท ABC'
```

---

## 📊 Database Schema

**ไม่มีการเปลี่ยนแปลง Database Schema**

ตาราง `core_status` และ `core_checkinlog` ยังคงเก็บข้อมูลเหมือนเดิม:
- `current_user_type` / `user_type`: 'student', 'staff', หรือ 'external'
- `year_level`: เก็บเฉพาะนักศึกษา (NULL สำหรับบุคลากร/ภายนอก)
- `education_level`: เก็บเฉพาะนักศึกษา
- `organization`: เก็บเฉพาะบุคคลภายนอก

---

## 🔑 Key Points

1. **UI เปลี่ยน**: 3 tabs → 2 tabs (Internal + External)
2. **Backend Logic**: ใช้ `year` จาก API เพื่อแยก student/staff อัตโนมัติ
3. **ความเข้ากันได้**: Database schema ไม่เปลี่ยน, logs เดิมยังใช้งานได้
4. **API ใช้ร่วมกัน**: `reg_api()` รองรับทั้งนักศึกษาและบุคลากร
5. **การจอง**: ตรวจสอบเฉพาะนักศึกษา (year > 0)

---

## 🚀 การใช้งาน

### 1. รัน Docker

```bash
cd lab_system
docker-compose restart web
```

### 2. เข้าหน้า Check-in

```
http://localhost/?pc_id=PC-01
```

### 3. ทดสอบ Internal

1. กด tab "นักศึกษา / บุคลากร"
2. กรอกรหัสนักศึกษา เช่น `65310001`
3. ระบบจะ:
   - เรียก API ดึงข้อมูล
   - ตรวจสอบ STUDENTYEAR
   - บันทึกเป็น 'student' หรือ 'staff' ตาม year

### 4. ทดสอบ External

1. กด tab "บุคคลภายนอก"
2. กรอกข้อมูลเอง:
   - เลขบัตรประชาชน
   - ชื่อ-นามสกุล
   - หน่วยงาน
3. ระบบบันทึกเป็น 'external'

---

## 📚 Related Documentation

- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - คู่มือ Authentication
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - คู่มือ Docker
- [QUICK_START.md](QUICK_START.md) - Quick Start Guide

---

**อัปเดตเมื่อ**: 2025-11-30
