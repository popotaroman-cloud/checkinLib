# 📊 Report Page Update - Lab Check-in System

## Overview

หน้ารายงานสถิติ (Report Page) ได้รับการพัฒนาให้สมบูรณ์ โดยเพิ่มฟีเจอร์การกรองข้อมูล, กราฟแสดงสถิติจากข้อมูลจริง, และการแสดงผลแบบ Real-time

---

## ✨ Features ที่เพิ่มเข้ามา

### 1. ระบบกรองข้อมูล (Data Filtering)

ผู้ใช้สามารถกรองข้อมูลได้ตาม:
- **ช่วงวันที่**: ตั้งแต่วันที่ - ถึงวันที่
- **ประเภทผู้ใช้**: ทั้งหมด / นักศึกษา / เจ้าหน้าที่ / บุคคลภายนอก

### 2. การแสดงสถิติแบบ Real-time

- **จำนวนรายการทั้งหมด**: นับจากข้อมูลที่กรอง
- **คะแนนเฉลี่ย**: คำนวณจากคะแนนความพึงพอใจที่มีค่ามากกว่า 0

### 3. กราฟแสดงสถิติ (Charts)

#### 3.1 กราฟสัดส่วนผู้ใช้งาน (Doughnut Chart)
- แสดงสัดส่วน: นักศึกษา / เจ้าหน้าที่ / บุคคลภายนอก
- สีแยกแยะตามประเภท:
  - นักศึกษา: สีน้ำเงิน (#0d6efd)
  - เจ้าหน้าที่: สีเขียว (#198754)
  - บุคคลภายนอก: สีเหลือง (#ffc107)

#### 3.2 กราฟความพึงพอใจ (Bar Chart)
- แสดงจำนวนโหวตแยกตามคะแนน: 5, 4, 3, 2, 1 ดาว
- แสดงเฉพาะคะแนนที่มีค่ามากกว่า 0

### 4. ตารางประวัติการใช้งาน

- แสดง 50 รายการล่าสุด (หลังจากกรองข้อมูล)
- แสดงข้อมูล:
  - เวลาเข้า
  - ผู้ใช้งาน (ชื่อ + ประเภท)
  - เครื่อง (PC ID)
  - ระยะเวลา
  - คะแนน

---

## 📁 Files Modified

### 1. `core/views.py` - report() function

**Location**: Lines 378-466

**Changes**:
- เพิ่มการรับค่าจาก Query Parameters (start_date, end_date, user_type)
- เพิ่ม Filter logic สำหรับวันที่และประเภทผู้ใช้
- คำนวณสถิติสำหรับกราฟ:
  - User type distribution (นับจำนวนแต่ละประเภท)
  - Rating distribution (นับจำนวนแต่ละคะแนน)
  - Average rating (คำนวณค่าเฉลี่ย)
- ส่งข้อมูลไปยัง template ผ่าน context

**Key Code**:
```python
def report(request):
    """หน้ารายงานสถิติพร้อมฟังก์ชันกรองข้อมูล"""
    from django.db.models import Count, Avg

    # รับค่าจาก Query Parameters
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    user_type_filter = request.GET.get('user_type', 'all')

    # เริ่มต้นด้วย queryset ทั้งหมด
    logs = CheckInLog.objects.all()

    # กรองตามวันที่
    if start_date:
        from datetime import datetime
        start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
        logs = logs.filter(checkin_time__gte=start_datetime)

    if end_date:
        from datetime import datetime, timedelta
        end_datetime = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
        logs = logs.filter(checkin_time__lt=end_datetime)

    # กรองตามประเภทผู้ใช้
    if user_type_filter != 'all':
        logs = logs.filter(user_type=user_type_filter)

    # คำนวณสถิติ...
```

---

### 2. `templates/manager/report.html`

**Changes**:

#### 2.1 Filter Form (Lines 36-62)
- เปลี่ยนจาก static form เป็น GET form
- เพิ่ม `name` attributes ให้กับ input fields
- เพิ่มปุ่ม "รีเซ็ต" สำหรับล้างค่ากรอง
- Preserve ค่าที่กรองไว้ด้วย `value="{{ start_date }}"` และ `selected`

```html
<form method="GET" action="{% url 'report' %}">
    <input type="date" name="start_date" value="{{ start_date }}">
    <input type="date" name="end_date" value="{{ end_date }}">
    <select name="user_type">
        <option value="all" {% if user_type_filter == 'all' %}selected{% endif %}>ทั้งหมด</option>
        ...
    </select>
    <button type="submit">แสดงผล</button>
    <a href="{% url 'report' %}">รีเซ็ต</a>
</form>
```

#### 2.2 Statistics Summary Card (Lines 64-78)
- แสดงสถิติสรุปจากข้อมูลที่กรอง
- แสดงจำนวนรายการทั้งหมด
- แสดงคะแนนเฉลี่ย

```html
{% if total_logs > 0 %}
<div class="card" style="background: linear-gradient(...)">
    <div>{{ total_logs }}</div>
    <div>{{ avg_rating }}</div>
</div>
{% endif %}
```

#### 2.3 Charts with Real Data (Lines 142-228)
- แทนที่ Hard-coded data ด้วยข้อมูลจาก backend
- เพิ่มการตรวจสอบข้อมูลว่าง (แสดงข้อความแทนกราฟเมื่อไม่มีข้อมูล)

**User Type Chart**:
```javascript
const studentCount = {{ student_count }};
const staffCount = {{ staff_count }};
const externalCount = {{ external_count }};

if (totalUsers === 0) {
    parent.innerHTML = '<p>ไม่มีข้อมูล</p>';
} else {
    new Chart(ctx1, {
        data: {
            datasets: [{
                data: [studentCount, staffCount, externalCount]
            }]
        }
    });
}
```

**Rating Chart**:
```javascript
const rating5 = {{ rating_5 }};
const rating4 = {{ rating_4 }};
// ... rating 3, 2, 1

new Chart(ctx2, {
    data: {
        datasets: [{
            data: [rating5, rating4, rating3, rating2, rating1]
        }]
    }
});
```

#### 2.4 Table Fix (Line 112)
- แก้ไขการแสดง PC ID จาก `{{ log.pc.pc_id }}` เป็น `{{ log.pc }}`
- เนื่องจาก CheckInLog.pc เป็น CharField ไม่ใช่ ForeignKey

---

## 🎯 How It Works

### 1. การกรองข้อมูล (Filtering)

**Flow**:
```
User submits form
    ↓
GET request with query parameters: ?start_date=2025-01-01&end_date=2025-12-31&user_type=student
    ↓
report() view รับค่าจาก request.GET
    ↓
Filter queryset ตามเงื่อนไข
    ↓
คำนวณสถิติจาก filtered queryset
    ↓
ส่งข้อมูลไป template
```

**Example Queries**:
```python
# Filter by date range
logs = logs.filter(checkin_time__gte=start_datetime)
logs = logs.filter(checkin_time__lt=end_datetime)

# Filter by user type
logs = logs.filter(user_type='student')
```

---

### 2. การคำนวณสถิติ (Statistics Calculation)

**User Type Distribution**:
```python
user_type_stats = logs.values('user_type').annotate(count=Count('id'))

# Result example:
# [
#     {'user_type': 'student', 'count': 60},
#     {'user_type': 'staff', 'count': 15},
#     {'user_type': 'external', 'count': 25}
# ]
```

**Rating Distribution**:
```python
rating_stats = logs.filter(rating__gt=0).values('rating').annotate(count=Count('id'))

# Result example:
# [
#     {'rating': 5, 'count': 30},
#     {'rating': 4, 'count': 20},
#     {'rating': 3, 'count': 10}
# ]
```

**Average Rating**:
```python
avg_rating = logs.filter(rating__gt=0).aggregate(Avg('rating'))['rating__avg'] or 0
# Result: 4.5
```

---

## 🧪 Testing

### Test Case 1: แสดงข้อมูลทั้งหมด

**Steps**:
1. เข้าหน้า `/manager/report/`
2. ไม่กรองอะไร

**Expected**:
- แสดงข้อมูลทั้งหมด
- กราฟแสดงสัดส่วนทุกประเภท
- ตารางแสดง 50 รายการล่าสุด

---

### Test Case 2: กรองตามวันที่

**Steps**:
1. เข้าหน้า `/manager/report/`
2. เลือก "ตั้งแต่วันที่": 2025-11-01
3. เลือก "ถึงวันที่": 2025-11-30
4. กดปุ่ม "แสดงผล"

**Expected**:
- URL เปลี่ยนเป็น: `/manager/report/?start_date=2025-11-01&end_date=2025-11-30&user_type=all`
- แสดงเฉพาะข้อมูลในเดือน พ.ย. 2025
- กราฟและสถิติอัปเดตตามข้อมูลที่กรอง

---

### Test Case 3: กรองตามประเภทผู้ใช้

**Steps**:
1. เข้าหน้า `/manager/report/`
2. เลือก "ประเภทผู้ใช้": นักศึกษา
3. กดปุ่ม "แสดงผล"

**Expected**:
- URL: `/manager/report/?user_type=student`
- แสดงเฉพาะข้อมูลนักศึกษา
- กราฟ User Type แสดงเฉพาะนักศึกษา 100%

---

### Test Case 4: กรองแบบรวม (Combined Filter)

**Steps**:
1. เข้าหน้า `/manager/report/`
2. กรอกวันที่: 2025-11-01 ถึง 2025-11-30
3. เลือกประเภท: เจ้าหน้าที่
4. กดปุ่ม "แสดงผล"

**Expected**:
- แสดงเฉพาะเจ้าหน้าที่ที่ใช้งานในเดือน พ.ย. 2025
- สถิติและกราฟอัปเดตตามเงื่อนไขทั้งหมด

---

### Test Case 5: ไม่มีข้อมูล (Empty Data)

**Steps**:
1. เข้าหน้า `/manager/report/`
2. เลือกวันที่ในอนาคตที่ยังไม่มีข้อมูล
3. กดปุ่ม "แสดงผล"

**Expected**:
- กราฟแสดงข้อความ "ไม่มีข้อมูล"
- ตารางแสดง "ยังไม่มีประวัติการใช้งาน"
- สถิติสรุปไม่แสดง (ซ่อนด้วย `{% if total_logs > 0 %}`)

---

### Test Case 6: รีเซ็ตการกรอง

**Steps**:
1. กรองข้อมูลตามต้องการ
2. กดปุ่ม "รีเซ็ต"

**Expected**:
- กลับไปหน้า `/manager/report/` (ไม่มี query parameters)
- แสดงข้อมูลทั้งหมด
- ฟอร์มกรองถูก reset

---

## 🎨 UI/UX Features

### 1. Form Persistence
- ค่าที่กรองไว้จะถูก preserve ในฟอร์ม
- ผู้ใช้สามารถแก้ไขเงื่อนไขได้ง่าย

### 2. Visual Feedback
- สถิติสรุปแสดงด้วย Gradient background
- กราฟใช้สีที่แยกแยะชัดเจน
- ตารางแสดงข้อมูลครบถ้วน

### 3. Empty State Handling
- แสดงข้อความเมื่อไม่มีข้อมูล
- ป้องกัน error เมื่อกราฟว่างเปล่า

---

## 📊 Context Data Passed to Template

```python
context = {
    # Logs data
    'logs': recent_logs,  # QuerySet of 50 latest logs (after filter)

    # User type statistics
    'student_count': int,   # Number of students
    'staff_count': int,     # Number of staff
    'external_count': int,  # Number of external users

    # Rating statistics
    'rating_5': int,  # Count of 5-star ratings
    'rating_4': int,  # Count of 4-star ratings
    'rating_3': int,  # Count of 3-star ratings
    'rating_2': int,  # Count of 2-star ratings
    'rating_1': int,  # Count of 1-star ratings
    'avg_rating': float,  # Average rating (rounded to 2 decimals)

    # Summary
    'total_logs': int,  # Total count after filtering

    # Filter values (for form persistence)
    'start_date': str,       # 'YYYY-MM-DD' or ''
    'end_date': str,         # 'YYYY-MM-DD' or ''
    'user_type_filter': str  # 'all', 'student', 'staff', or 'external'
}
```

---

## 🔗 Related Files

- **View**: [core/views.py:378-466](core/views.py#L378-L466)
- **Template**: [templates/manager/report.html](templates/manager/report.html)
- **Model**: [core/models.py](core/models.py) - CheckInLog model
- **URL**: [core/urls.py](core/urls.py) - `path('manager/report/', views.report, name='report')`

---

## 🚀 Future Enhancements

### 1. Date Presets
เพิ่มปุ่มกดเลือกช่วงวันที่สำเร็จรูป:
- วันนี้
- สัปดาห์นี้
- เดือนนี้
- เดือนที่แล้ว

### 2. Export Filtered Data
ปุ่ม "ดาวน์โหลด CSV" ควร export เฉพาะข้อมูลที่กรอง

### 3. More Charts
- กราฟแสดงการใช้งานแต่ละเครื่อง (PC Usage)
- กราฟแสดงช่วงเวลาที่ใช้งานมากที่สุด (Peak Hours)
- กราฟแสดง Trend การใช้งานตามเวลา (Time Series)

### 4. Pagination
เพิ่ม Pagination สำหรับตารางประวัติการใช้งาน

### 5. Real-time Updates
ใช้ AJAX/WebSocket เพื่ออัปเดตสถิติแบบ Real-time

---

## ✅ Completion Checklist

- [x] Update report() view with filtering logic
- [x] Calculate real statistics for charts
- [x] Update template with GET form
- [x] Pass statistics to template context
- [x] Update JavaScript charts with real data
- [x] Handle empty data gracefully
- [x] Fix table display (pc field)
- [x] Test with various filters
- [x] Create documentation

---

**Last Updated**: 2025-12-01

**Status**: ✅ Completed

**Tested**: Docker environment

**Browser Compatibility**: Chrome, Firefox, Edge, Safari
