# 📥 CSV Export with Filtering - Lab Check-in System

## Overview

อัปเดตฟังก์ชัน **ดาวน์โหลด CSV** ให้รองรับการกรองข้อมูลตามเงื่อนไขเดียวกับหน้ารายงานสรุป ผู้ใช้สามารถ export ข้อมูลเฉพาะช่วงที่ต้องการได้

---

## ✨ Features ที่เพิ่มเข้ามา

### 1. **รองรับการกรองข้อมูล**
CSV export ตอนนี้รองรับ query parameters เหมือนกับหน้ารายงาน:
- `start_date`: ตั้งแต่วันที่ (YYYY-MM-DD)
- `end_date`: ถึงวันที่ (YYYY-MM-DD)
- `user_type`: ประเภทผู้ใช้ (all/student/staff/external)

### 2. **ชื่อไฟล์แบบ Dynamic**
ชื่อไฟล์ CSV จะเปลี่ยนตามเงื่อนไขการกรอง:
- ทั้งหมด: `usage_report.csv`
- กรองวันที่: `usage_report_2025-11-01_to_2025-11-30.csv`
- กรองประเภท: `usage_report_student.csv`
- กรองทั้งสอง: `usage_report_2025-11-01_to_2025-11-30_student.csv`

### 3. **แสดงจำนวนรายการบนปุ่ม**
ปุ่ม "ดาวน์โหลด CSV" แสดงจำนวนรายการที่จะถูก export:
- "ดาวน์โหลด CSV (150 รายการ)"
- "ดาวน์โหลด CSV (ทั้งหมด)" - เมื่อไม่ได้กรอง

---

## 📁 Files Modified

### 1. `core/views.py` - export_csv() function

**Location**: Lines 468-535

**Changes**:

#### 1.1 เพิ่มการรับค่า Query Parameters
```python
def export_csv(request):
    """ฟังก์ชันดาวน์โหลด CSV พร้อมข้อมูลครบถ้วน (รองรับการกรองข้อมูล)"""
    # รับค่าจาก Query Parameters (เหมือนกับหน้า report)
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    user_type_filter = request.GET.get('user_type', 'all')
```

#### 1.2 ใช้ Filter Logic เดียวกับหน้า report
```python
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

    # เรียงลำดับตามเวลา
    logs = logs.order_by('-checkin_time')
```

#### 1.3 สร้างชื่อไฟล์แบบ Dynamic
```python
    # สร้าง filename ตามเงื่อนไขการกรอง
    filename_parts = ['usage_report']

    if start_date and end_date:
        filename_parts.append(f'{start_date}_to_{end_date}')
    elif start_date:
        filename_parts.append(f'from_{start_date}')
    elif end_date:
        filename_parts.append(f'until_{end_date}')

    if user_type_filter != 'all':
        filename_parts.append(user_type_filter)

    filename = '_'.join(filename_parts) + '.csv'
```

**Example Filenames**:
```
usage_report.csv
usage_report_2025-11-01_to_2025-11-30.csv
usage_report_from_2025-11-01.csv
usage_report_until_2025-11-30.csv
usage_report_student.csv
usage_report_2025-11-01_to_2025-11-30_external.csv
```

---

### 2. `templates/manager/report.html` - Export Button

**Location**: Line 31

**Changes**:

#### 2.1 เพิ่ม Query Parameters ให้ปุ่ม Download
```html
<!-- Before -->
<a href="{% url 'export_csv' %}" class="btn btn-primary">
    <i class="fas fa-file-csv"></i> ดาวน์โหลด CSV
</a>

<!-- After -->
<a href="{% url 'export_csv' %}?start_date={{ start_date }}&end_date={{ end_date }}&user_type={{ user_type_filter }}"
   class="btn btn-primary" style="background-color: var(--success);">
    <i class="fas fa-file-csv"></i> ดาวน์โหลด CSV ({{ total_logs|default:"ทั้งหมด" }} รายการ)
</a>
```

**Key Points**:
- ส่งค่า `start_date`, `end_date`, `user_type_filter` ไปใน URL
- แสดงจำนวนรายการจาก `{{ total_logs }}`
- ถ้าไม่มี `total_logs` จะแสดง "ทั้งหมด" (ใช้ Django template filter `|default`)

---

## 🎯 How It Works

### Flow Diagram

```
User กรองข้อมูลในหน้า Report
    ↓
กดปุ่ม "ดาวน์โหลด CSV"
    ↓
URL: /manager/export-csv/?start_date=2025-11-01&end_date=2025-11-30&user_type=student
    ↓
export_csv() รับค่าจาก request.GET
    ↓
Filter queryset ตามเงื่อนไข (เหมือนหน้า report)
    ↓
สร้างชื่อไฟล์จากเงื่อนไข
    ↓
เขียนข้อมูลลง CSV
    ↓
ส่งไฟล์กลับให้ User download
```

---

## 🧪 Test Cases

### Test Case 1: Export ทั้งหมด (No Filter)

**Steps**:
1. เข้าหน้า `/manager/report/`
2. ไม่กรองอะไร
3. กดปุ่ม "ดาวน์โหลด CSV"

**Expected**:
- URL: `/manager/export-csv/?start_date=&end_date=&user_type=all`
- ไฟล์: `usage_report.csv`
- ข้อมูล: ทั้งหมดในระบบ
- ปุ่มแสดง: "ดาวน์โหลด CSV (ทั้งหมด)"

---

### Test Case 2: Export ข้อมูลตามช่วงวันที่

**Steps**:
1. เข้าหน้า `/manager/report/`
2. กรอง "ตั้งแต่วันที่": 2025-11-01
3. กรอง "ถึงวันที่": 2025-11-30
4. กด "แสดงผล"
5. กดปุ่ม "ดาวน์โหลด CSV"

**Expected**:
- URL: `/manager/export-csv/?start_date=2025-11-01&end_date=2025-11-30&user_type=all`
- ไฟล์: `usage_report_2025-11-01_to_2025-11-30.csv`
- ข้อมูล: เฉพาะเดือน พ.ย. 2025
- ปุ่มแสดง: "ดาวน์โหลด CSV (X รายการ)" - X คือจำนวนจริง

---

### Test Case 3: Export ข้อมูลนักศึกษาเท่านั้น

**Steps**:
1. เข้าหน้า `/manager/report/`
2. เลือก "ประเภทผู้ใช้": นักศึกษา
3. กด "แสดงผล"
4. กดปุ่ม "ดาวน์โหลด CSV"

**Expected**:
- URL: `/manager/export-csv/?start_date=&end_date=&user_type=student`
- ไฟล์: `usage_report_student.csv`
- ข้อมูล: เฉพาะนักศึกษา
- CSV มีเฉพาะแถวที่ User Type = "นักศึกษา"

---

### Test Case 4: Export ด้วยเงื่อนไขรวม

**Steps**:
1. เข้าหน้า `/manager/report/`
2. กรอง "ตั้งแต่วันที่": 2025-10-01
3. กรอง "ถึงวันที่": 2025-10-31
4. เลือก "ประเภทผู้ใช้": เจ้าหน้าที่
5. กด "แสดงผล"
6. กดปุ่ม "ดาวน์โหลด CSV"

**Expected**:
- URL: `/manager/export-csv/?start_date=2025-10-01&end_date=2025-10-31&user_type=staff`
- ไฟล์: `usage_report_2025-10-01_to_2025-10-31_staff.csv`
- ข้อมูล: เฉพาะเจ้าหน้าที่ ที่ใช้งานในเดือน ต.ค. 2025

---

### Test Case 5: Export เฉพาะวันที่เริ่มต้น

**Steps**:
1. เข้าหน้า `/manager/report/`
2. กรอง "ตั้งแต่วันที่": 2025-11-15
3. ไม่กรอง "ถึงวันที่"
4. กด "แสดงผล"
5. กดปุ่ม "ดาวน์โหลด CSV"

**Expected**:
- URL: `/manager/export-csv/?start_date=2025-11-15&end_date=&user_type=all`
- ไฟล์: `usage_report_from_2025-11-15.csv`
- ข้อมูล: ตั้งแต่ 15 พ.ย. 2025 จนถึงปัจจุบัน

---

### Test Case 6: Export เฉพาะวันที่สิ้นสุด

**Steps**:
1. เข้าหน้า `/manager/report/`
2. ไม่กรอง "ตั้งแต่วันที่"
3. กรอง "ถึงวันที่": 2025-11-30
4. กด "แสดงผล"
5. กดปุ่ม "ดาวน์โหลด CSV"

**Expected**:
- URL: `/manager/export-csv/?start_date=&end_date=2025-11-30&user_type=all`
- ไฟล์: `usage_report_until_2025-11-30.csv`
- ข้อมูล: ตั้งแต่เริ่มต้นจนถึง 30 พ.ย. 2025

---

## 📊 CSV File Structure

CSV file ยังคงมีโครงสร้างเดิม แต่จะมีเฉพาะข้อมูลที่ผ่านการกรอง:

```csv
Log ID,PC ID,User Type,User ID,User Name,Faculty/Department,Year Level,Education Level,Organization,Check-in Time,Check-out Time,Duration (Minutes),Duration (Hours:Minutes),Rating,Comment,Software ประจำเครื่อง
1,PC-01,นักศึกษา,65310001,นายสมชาย ใจดี,วิทยาศาสตร์,3,ปริญญาตรี,-,2025-11-15 09:00:00,2025-11-15 11:00:00,120,2:00,5,เครื่องเร็วดีครับ,Microsoft Office 2021
2,PC-03,บุคคลภายนอก,1234567890123,นายวิชัย นักวิจัย,-,-,-,มหาวิทยาลัยเทคโนโลยีราชมงคล,2025-11-15 13:00:00,2025-11-15 13:45:00,45,0:45,4,สะดวกดีครับ,AutoCAD 2022
```

---

## 🎨 UI Changes

### Before
```
[ดาวน์โหลด CSV]
```

### After
```
[ดาวน์โหลด CSV (150 รายการ)]  ← แสดงจำนวนที่จะ export
```

**Benefits**:
- ผู้ใช้รู้ว่าจะได้ข้อมูลกี่รายการ
- ป้องกันการ export ข้อมูลผิด
- ยืนยันว่าการกรองทำงานถูกต้อง

---

## 🔗 URL Examples

### 1. Export ทั้งหมด
```
/manager/export-csv/
/manager/export-csv/?user_type=all
```

### 2. Export ช่วงวันที่
```
/manager/export-csv/?start_date=2025-11-01&end_date=2025-11-30
```

### 3. Export ประเภทผู้ใช้
```
/manager/export-csv/?user_type=student
/manager/export-csv/?user_type=staff
/manager/export-csv/?user_type=external
```

### 4. Export แบบรวม
```
/manager/export-csv/?start_date=2025-11-01&end_date=2025-11-30&user_type=student
```

---

## 💡 Technical Implementation

### Consistency with Report Page

ใช้ Filter logic เหมือนกันทั้งหมด:

**report() function**:
```python
logs = CheckInLog.objects.all()
if start_date:
    logs = logs.filter(checkin_time__gte=start_datetime)
if end_date:
    logs = logs.filter(checkin_time__lt=end_datetime)
if user_type_filter != 'all':
    logs = logs.filter(user_type=user_type_filter)
```

**export_csv() function**:
```python
logs = CheckInLog.objects.all()
if start_date:
    logs = logs.filter(checkin_time__gte=start_datetime)
if end_date:
    logs = logs.filter(checkin_time__lt=end_datetime)
if user_type_filter != 'all':
    logs = logs.filter(user_type=user_type_filter)
```

**Benefit**: ข้อมูลที่เห็นในหน้า report = ข้อมูลที่ download ได้ (WYSIWYG)

---

## 🚀 Future Enhancements

### 1. Export Current View Only
เพิ่มออพชัน "Export 50 รายการที่แสดง" vs "Export ทั้งหมด"

### 2. Format Options
- CSV (UTF-8 with BOM)
- Excel (.xlsx)
- PDF Report

### 3. Scheduled Export
- กำหนดเวลา export อัตโนมัติ (รายวัน/รายสัปดาห์/รายเดือน)
- ส่งอีเมลพร้อม attachment

### 4. Custom Columns
ให้ผู้ใช้เลือก columns ที่ต้องการ export

---

## ✅ Completion Checklist

- [x] Update export_csv() to accept query parameters
- [x] Add date range filtering logic
- [x] Add user type filtering logic
- [x] Create dynamic filename based on filters
- [x] Update export button to pass parameters
- [x] Show record count on button
- [x] Test with various filter combinations
- [x] Verify CSV content matches report page
- [x] Create documentation

---

## 🔗 Related Files

- **View**: [core/views.py:468-535](core/views.py#L468-L535)
- **Template**: [templates/manager/report.html:31](templates/manager/report.html#L31)
- **URL**: [core/urls.py](core/urls.py) - `path('manager/export-csv/', views.export_csv, name='export_csv')`
- **Related Doc**: [REPORT_PAGE_UPDATE.md](REPORT_PAGE_UPDATE.md)

---

**Last Updated**: 2025-12-01

**Status**: ✅ Completed

**Tested**: Docker environment

**Compatibility**: Works seamlessly with report page filtering
