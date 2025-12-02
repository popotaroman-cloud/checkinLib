# 📋 Test Scenarios - Lab Check-in System

## Overview

This document describes comprehensive test scenarios covering end-to-end workflows and user journeys for the Lab Check-in System.

---

## Table of Contents

1. [Student Check-in/out Journey](#scenario-1-student-check-inout-journey)
2. [Staff Member Uses Lab](#scenario-2-staff-member-uses-lab)
3. [External Visitor](#scenario-3-external-visitor)
4. [Admin Daily Operations](#scenario-4-admin-daily-operations)
5. [Admin Reserves PC for Staff](#scenario-5-admin-reserves-pc-for-staff)
6. [Computer Maintenance](#scenario-6-computer-maintenance)
7. [Peak Hour Usage](#scenario-7-peak-hour-usage)
8. [System Migration](#scenario-8-system-migration)
9. [Error Recovery](#scenario-9-error-recovery)
10. [Security Testing](#scenario-10-security-testing)

---

## Scenario 1: Student Check-in/out Journey

### Description
A student comes to use the lab, checks in, works for 2 hours, and checks out.

### Preconditions
- Student ID: `65310001` exists in UBU system
- PC-01 is available
- Lab is operational

### Steps

#### 1.1 Student Arrives at Lab
```
Time: 09:00 AM
Location: In front of PC-01
```

1. Student sees Kiosk screen showing QR code
2. Screen displays: "PC-01 ว่างพร้อมใช้งาน"
3. Student taps "เข้าใช้งาน" button

**Expected:** Redirect to check-in page

---

#### 1.2 Check-in Process
```
Time: 09:01 AM
Page: /checkin/PC-01/
```

1. Tab "นักศึกษา / บุคลากร" is active
2. Student enters ID: `65310001`
3. Student taps "ยืนยันเข้าใช้งาน"
4. System calls reg_api
5. API returns:
   ```json
   {
     "success": true,
     "name": "นายสมชาย ใจดี",
     "faculty": "วิทยาศาสตร์",
     "year": 3,
     "level": "ปริญญาตรี"
   }
   ```

**Expected:**
- Success message: "ยินดีต้อนรับ: นายสมชาย ใจดี"
- Redirect to `/?pc_id=PC-01`
- Screen shows: "กำลังใช้งานโดย นายสมชาย ใจดี"
- Button changed to "ออกจากระบบ"

---

#### 1.3 Student Works on PC
```
Time: 09:01 AM - 11:00 AM
Duration: 119 minutes
```

**Expected:**
- Kiosk screen stays on active session page
- Shows timer/start time
- Manager dashboard shows PC-01 as "ใช้งาน" (red)

---

#### 1.4 Admin Checks Dashboard
```
Time: 10:00 AM (during student session)
User: Admin
Page: /manager/dashboard/
```

**Expected:**
- PC-01 card shows:
  - Status: "ใช้งาน" (red background)
  - Username: "นายสมชาย ใจดี"
  - Time: "09:01 น."

---

#### 1.5 Check-out Process
```
Time: 11:00 AM
Page: /?pc_id=PC-01
```

1. Student taps "ออกจากระบบ"
2. Redirect to `/checkout/PC-01/`
3. Student selects rating: 5 stars
4. Student enters comment: "เครื่องเร็วดีครับ"
5. Student taps submit

**Expected:**
- Success: "ขอบคุณที่ใช้บริการ"
- Redirect to `/?pc_id=PC-01`
- Screen shows "ว่างพร้อมใช้งาน"
- CheckInLog created with:
  - user_id: `65310001`
  - user_name: "นายสมชาย ใจดี"
  - user_type: `student`
  - duration_minutes: 119
  - rating: 5
  - comment: "เครื่องเร็วดีครับ"

---

#### 1.6 Admin Views Report
```
Time: 11:30 AM
Page: /manager/report/
```

**Expected:**
- Latest log shows student session
- All fields populated correctly
- Can export to CSV

---

### Postconditions
- PC-01 is available
- CheckInLog record exists
- Student can check-in again

### Test Data
| Field | Value |
|-------|-------|
| Student ID | 65310001 |
| Name | นายสมชาย ใจดี |
| Faculty | วิทยาศาสตร์ |
| Year | 3 |
| Check-in | 09:01 AM |
| Check-out | 11:00 AM |
| Duration | 119 minutes |
| Rating | 5 |

---

## Scenario 2: Staff Member Uses Lab

### Description
A faculty member needs to use a computer for urgent work.

### Preconditions
- Staff ID: `teacher001` exists
- All PCs are occupied except PC-05
- Admin is logged in

### Steps

#### 2.1 Admin Reserves PC for Staff
```
Time: 14:00
User: Admin
Page: /manager/manage/
```

1. Admin finds PC-05 (available)
2. Clicks "แก้ไข"
3. Changes status to "ใช้งาน"
4. Clicks "บันทึก"
5. Modal appears: "กรุณากรอกรหัสเจ้าหน้าที่"
6. Admin enters: `teacher001`
7. Clicks "ยืนยัน"
8. System calls reg_api
9. API returns:
   ```json
   {
     "success": true,
     "name": "อ.ดร.สมหญิง รักงาน",
     "faculty": "วิทยาศาสตร์",
     "year": 0
   }
   ```

**Expected:**
- Success: "เปลี่ยนสถานะเป็น 'ใช้งาน' สำเร็จ (ผู้ใช้: อ.ดร.สมหญิง รักงาน)"
- PC-05 status = `in_use`
- user_type = `staff`
- year_level = NULL

---

#### 2.2 Staff Works on PC
```
Time: 14:00 - 16:30
Duration: 150 minutes
```

**Expected:**
- Dashboard shows PC-05 in use by staff
- Kiosk shows staff name

---

#### 2.3 Staff Finishes Work
```
Time: 16:30
Location: PC-05 Kiosk
```

1. Staff taps "ออกจากระบบ"
2. Gives rating: 5 stars
3. Comment: "ขอบคุณครับ"
4. Submits

**Expected:**
- CheckInLog created
- user_type = `staff`
- year_level = NULL
- Duration = 150 minutes

---

### Test Data
| Field | Value |
|-------|-------|
| Staff ID | teacher001 |
| Name | อ.ดร.สมหญิง รักงาน |
| Faculty | วิทยาศาสตร์ |
| User Type | staff |
| Year | NULL |
| Duration | 150 minutes |

---

## Scenario 3: External Visitor

### Description
A visitor from another university needs to use the lab.

### Preconditions
- PC-03 is available
- Visitor has ID card

### Steps

#### 3.1 Visitor Check-in
```
Time: 13:00
Location: PC-03
```

1. Visitor taps "เข้าใช้งาน"
2. Selects "บุคคลภายนอก" tab
3. Enters:
   - ID Card: `1234567890123`
   - Name: `นายวิชัย นักวิจัย`
   - Organization: `มหาวิทยาลัยเทคโนโลยีราชมงคล`
4. Submits

**Expected:**
- Success message
- PC-03 shows visitor name
- user_type = `external`
- organization field populated

---

#### 3.2 Visitor Works
```
Duration: 45 minutes
```

---

#### 3.3 Check-out
```
Time: 13:45
```

1. Visitor checks out
2. Rating: 4 stars
3. Comment: "สะดวกดีครับ"

**Expected:**
- Log created with organization field
- All external user fields populated

---

## Scenario 4: Admin Daily Operations

### Description
Admin's typical daily workflow: login, check status, manage PCs, view reports.

### Steps

#### 4.1 Morning Check
```
Time: 08:00 AM
```

1. Navigate to `/manager/login/`
2. Login: admin/admin123
3. Dashboard shows all PCs available (green)
4. Stats: Total=10, Available=10, Occupied=0, Maintenance=0

---

#### 4.2 Enable All PCs
```
Time: 08:05 AM
```

1. Check if any PC is disabled
2. Enable them via dashboard (click disabled PCs)

---

#### 4.3 Monitor During Peak Hours
```
Time: 10:00 AM - 12:00 PM
```

1. Dashboard auto-refreshes every 30s
2. Watch PCs change from green → red as students check-in
3. Stats update in real-time

---

#### 4.4 Lunch Break - Disable Some PCs
```
Time: 12:00 PM
```

1. Click PC-01 (in use)
2. Confirm force checkout
3. Change to disabled
4. Repeat for PC-02, PC-03

**Expected:**
- Force checkout creates logs
- PCs show "ซ่อม" status

---

#### 4.5 Afternoon Report
```
Time: 14:00
```

1. Navigate to `/manager/report/`
2. Review morning logs
3. Export CSV for record keeping

---

#### 4.6 End of Day
```
Time: 17:00
```

1. Check all PCs checked out
2. Force checkout any remaining sessions
3. Disable all PCs
4. Logout

---

## Scenario 5: Admin Reserves PC for Staff

### Description
Admin helps a staff member who doesn't know their staff ID.

### Steps

#### 5.1 Staff Calls Admin
```
Time: 10:00 AM
Situation: Staff at PC-07, forgot staff ID
```

1. Admin opens dashboard
2. Clicks PC-07 (available)
3. Modal asks for staff ID
4. Admin tries different IDs until success
5. PC-07 assigned to staff

**Expected:**
- Multiple API calls logged
- Eventually succeeds
- Staff can use PC

---

## Scenario 6: Computer Maintenance

### Description
A computer needs repair. Admin marks it for maintenance.

### Preconditions
- PC-04 is in use
- Hardware problem reported

### Steps

#### 6.1 Mark for Maintenance
```
Time: 11:00 AM
Page: /manager/manage/
```

1. Admin finds PC-04 (in use)
2. Clicks "แก้ไข"
3. Changes to "ซ่อม"
4. Warning: "ผู้ใช้งาน... จะถูก checkout"
5. Confirms

**Expected:**
- Force checkout log created
- PC-04 status = `disabled`
- Kiosk shows "งดให้บริการ"

---

#### 6.2 Maintenance Period
```
Duration: 2 days
```

- PC-04 unavailable for check-in
- Dashboard shows gray card

---

#### 6.3 Re-enable After Repair
```
Time: 2 days later, 09:00 AM
```

1. Admin opens manage page
2. Finds PC-04, clicks "แก้ไข"
3. Changes to "ว่าง"
4. Saves

**Expected:**
- PC-04 available again
- No staff ID required (disabled → available)

---

## Scenario 7: Peak Hour Usage

### Description
All 10 PCs in use simultaneously during peak hours.

### Preconditions
- 10 PCs exist
- Peak hour: 10:00-12:00

### Steps

#### 7.1 Concurrent Check-ins
```
Time: 10:00 - 10:05 AM
Users: 10 students arrive simultaneously
```

1. All students tap "เข้าใช้งาน" on their PCs
2. Each enters their student ID
3. All submit within 1 minute

**Expected:**
- All check-ins succeed
- No race conditions
- All PCs show "ใช้งาน"
- Dashboard stats: Occupied=10, Available=0

---

#### 7.2 Late Student Arrives
```
Time: 10:10 AM
User: Student #11
```

1. Student tries to check-in to PC-01 (occupied)
2. Gets error: "เครื่อง PC-01 ไม่ว่างในขณะนี้"
3. Student must wait

---

#### 7.3 First Checkout
```
Time: 11:00 AM
User: Student #1 finishes
```

1. PC-01 becomes available
2. Student #11 immediately checks in

**Expected:**
- Smooth transition
- No conflicts

---

## Scenario 8: System Migration

### Description
Migrating from SQLite to MySQL in production.

### Steps

#### 8.1 Export Data (SQLite)
```
Database: db.sqlite3
```

1. Export all tables to JSON
2. Backup database file

---

#### 8.2 Setup MySQL
```
Commands:
CREATE DATABASE lab_checkin_db;
CREATE USER 'labuser'@'localhost';
GRANT ALL PRIVILEGES...
```

---

#### 8.3 Migrate Schema
```
Environment: DB_ENGINE=mysql
```

```bash
python manage.py migrate
```

**Expected:**
- All tables created
- Foreign keys intact

---

#### 8.4 Import Data
```
python manage.py loaddata backup.json
```

---

#### 8.5 Verify
1. Login to admin
2. Check all PCs exist
3. View reports - historical data present
4. Test check-in/out

---

## Scenario 9: Error Recovery

### Description
System handles various error conditions gracefully.

### Steps

#### 9.1 API Timeout
```
Situation: reg_api times out
```

1. Student enters ID
2. Submits
3. Wait 10 seconds
4. Error: "หมดเวลาการเชื่อมต่อ API (Timeout)"
5. Student can retry

---

#### 9.2 Network Disconnection
```
Situation: Internet down mid-session
```

1. Student already checked in
2. Network fails
3. Student tries to checkout
4. Error message displayed
5. When network restores, checkout succeeds

---

#### 9.3 Database Lock
```
Situation: Multiple simultaneous writes
```

1. 5 users check out simultaneously
2. Django handles transactions
3. All complete successfully

---

#### 9.4 Invalid Data Recovery
```
Situation: Corrupted session data
```

1. Admin force checkout corrupted session
2. Clean status record
3. PC available again

---

## Scenario 10: Security Testing

### Description
Verify system security measures.

### Steps

#### 10.1 Unauthorized Access Attempt
```
User: Not logged in
```

1. Try to access `/manager/dashboard/`
2. Redirect to login
3. Try `/api/add-computer/`
4. Redirect to login

**Expected:** All protected routes secured

---

#### 10.2 Non-Staff Access
```
User: Regular user (not staff)
```

1. Login with non-staff account
2. Redirect with error: "ต้องเป็น Admin เท่านั้น"

---

#### 10.3 XSS Prevention
```
Input: <script>alert('XSS')</script>
```

1. Enter as comment in checkout
2. Submit
3. View in dashboard
4. Script not executed, shown as text

---

#### 10.4 SQL Injection Prevention
```
Input: PC-01'; DROP TABLE core_computer; --
```

1. Enter as PC ID
2. Submit
3. Django ORM prevents injection
4. Tables intact

---

#### 10.5 CSRF Protection
```
Test: External POST without CSRF token
```

1. POST to `/api/add-computer/` without token
2. Request rejected

---

## Summary Matrix

| Scenario | Category | Duration | PCs Used | Users | Priority |
|----------|----------|----------|----------|-------|----------|
| 1. Student Journey | Happy Path | 2 hours | 1 | 1 | High |
| 2. Staff Usage | Happy Path | 2.5 hours | 1 | 2 | High |
| 3. External Visitor | Happy Path | 45 min | 1 | 1 | Medium |
| 4. Admin Daily Ops | Operations | Full day | All | 1 | High |
| 5. Admin Reserves | Operations | 15 min | 1 | 2 | Medium |
| 6. Maintenance | Operations | 2 days | 1 | 1 | High |
| 7. Peak Hour | Load Test | 2 hours | 10 | 11 | High |
| 8. Migration | DevOps | 1 hour | All | 1 | Critical |
| 9. Error Recovery | Negative | Varies | Varies | Varies | High |
| 10. Security | Security | 30 min | Varies | Varies | Critical |

---

## Test Execution Checklist

### Before Testing
- [ ] Database is clean/reset
- [ ] All PCs are available
- [ ] Sample data loaded
- [ ] Admin account exists
- [ ] reg_api is accessible
- [ ] Docker/Server running

### During Testing
- [ ] Record all deviations
- [ ] Screenshot errors
- [ ] Note performance issues
- [ ] Log API response times

### After Testing
- [ ] Complete test summary
- [ ] Update bug tracker
- [ ] Document findings
- [ ] Create test report

---

**Test Date:** _________________

**Tester:** _________________

**Environment:** Development / Staging / Production

**Browser:** _________________

**Database:** SQLite / MySQL

**Notes:** _________________
