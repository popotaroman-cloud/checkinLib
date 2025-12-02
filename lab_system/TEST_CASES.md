# 🧪 Test Cases - Lab Check-in System

## สารบัญ

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Check-in System](#2-check-in-system)
3. [Check-out System](#3-check-out-system)
4. [Manager Dashboard](#4-manager-dashboard)
5. [Computer Management](#5-computer-management)
6. [Status Change with Staff Authentication](#6-status-change-with-staff-authentication)
7. [Software Management](#7-software-management)
8. [Report & Export](#8-report--export)
9. [API Endpoints](#9-api-endpoints)
10. [Edge Cases & Error Handling](#10-edge-cases--error-handling)

---

## 1. Authentication & Authorization

### TC-AUTH-001: Manager Login - Success
**Prerequisites:** Admin account exists (admin/admin123)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/login/` | Login page displays |
| 2 | Enter username: `admin` | Username field populated |
| 3 | Enter password: `admin123` | Password field populated (masked) |
| 4 | Click "เข้าสู่ระบบ" button | Redirect to `/manager/dashboard/` |
| 5 | Verify page content | Dashboard with PC grid displays |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-AUTH-002: Manager Login - Invalid Credentials
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/login/` | Login page displays |
| 2 | Enter username: `wronguser` | Username field populated |
| 3 | Enter password: `wrongpass` | Password field populated |
| 4 | Click "เข้าสู่ระบบ" | Error message: "Username หรือ Password ไม่ถูกต้อง" |
| 5 | Verify current page | Still on login page |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-AUTH-003: Manager Login - Non-Staff User
**Prerequisites:** Regular user account exists (not staff)

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/login/` | Login page displays |
| 2 | Enter non-staff credentials | Login form submitted |
| 3 | Click "เข้าสู่ระบบ" | Error: "คุณไม่มีสิทธิ์เข้าถึง (ต้องเป็น Staff/Admin เท่านั้น)" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-AUTH-004: Access Protected Route Without Login
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/dashboard/` (not logged in) | Redirect to `/manager/login/?next=/manager/dashboard/` |
| 2 | Verify URL | Contains `next` parameter |
| 3 | Login with valid credentials | Redirect back to `/manager/dashboard/` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-AUTH-005: Manager Logout
**Prerequisites:** Logged in as admin

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/dashboard/` | Dashboard displays |
| 2 | Click "ออกจากระบบ" button | Success message: "ออกจากระบบเรียบร้อยแล้ว" |
| 3 | Verify redirect | Redirect to `/` (Kiosk home) |
| 4 | Try to access `/manager/dashboard/` | Redirect to login page |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-AUTH-006: Admin Login Redirect
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/admin/login/` | Redirect to `/manager/login/` |
| 2 | Verify URL change | URL is `/manager/login/` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 2. Check-in System

### TC-CHECKIN-001: Internal User (Student) - Success
**Prerequisites:**
- PC-01 is available
- Valid student ID with year > 0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/?pc_id=PC-01` | Kiosk page displays |
| 2 | Click "เข้าใช้งาน" | Redirect to `/checkin/PC-01/` |
| 3 | Tab "นักศึกษา / บุคลากร" is active | Internal tab shows |
| 4 | Enter student ID: `65310001` | ID field populated |
| 5 | Click "ยืนยันเข้าใช้งาน" | API call to reg_api |
| 6 | Verify response | Success message with student name |
| 7 | Verify redirect | Back to `/?pc_id=PC-01` |
| 8 | Verify PC status | Shows "ใช้งาน" with student name |

**Data Validation:**
- Status: `in_use`
- User type: `student`
- Year level: > 0
- Faculty: populated from API

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKIN-002: Internal User (Staff) - Success
**Prerequisites:**
- PC-01 is available
- Valid staff ID with year = 0

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/checkin/PC-01/` | Check-in page displays |
| 2 | Tab "นักศึกษา / บุคลากร" active | Internal tab shows |
| 3 | Enter staff ID: `teacher001` | ID field populated |
| 4 | Click "ยืนยันเข้าใช้งาน" | API call to reg_api |
| 5 | Verify response | Success with staff name |
| 6 | Verify PC status | User type = `staff`, no year level |

**Data Validation:**
- Status: `in_use`
- User type: `staff`
- Year level: `NULL`
- Education level: `NULL`

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKIN-003: External User - Success
**Prerequisites:** PC-01 is available

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/checkin/PC-01/` | Check-in page displays |
| 2 | Click "บุคคลภายนอก" tab | External tab shows |
| 3 | Enter ID card: `1234567890123` | Field populated |
| 4 | Enter name: `นายทดสอบ ระบบ` | Field populated |
| 5 | Enter organization: `บริษัท XYZ` | Field populated |
| 6 | Click submit | Success message |
| 7 | Verify PC status | User type = `external` |

**Data Validation:**
- Status: `in_use`
- User type: `external`
- Organization: populated
- Faculty/Year: `NULL`

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKIN-004: Invalid User ID (API Not Found)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/checkin/PC-01/` | Check-in page displays |
| 2 | Enter invalid ID: `99999999` | Field populated |
| 3 | Click submit | Error: "ไม่พบข้อมูลในระบบ" |
| 4 | Verify PC status | Still `available` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKIN-005: Check-in to Occupied PC
**Prerequisites:** PC-01 is `in_use`

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/checkin/PC-01/` | Warning: "เครื่อง PC-01 ไม่ว่างในขณะนี้" |
| 2 | Verify redirect | Back to `/?pc_id=PC-01` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKIN-006: Empty Form Submission
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/checkin/PC-01/` | Check-in page displays |
| 2 | Click submit without entering data | Browser validation: "กรุณากรอกฟิลด์นี้" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 3. Check-out System

### TC-CHECKOUT-001: Normal Checkout with Feedback
**Prerequisites:** PC-01 is `in_use` by a student

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/?pc_id=PC-01` | Shows "ออกจากระบบ" button |
| 2 | Click "ออกจากระบบ" | Redirect to `/checkout/PC-01/` |
| 3 | Select rating: 5 stars | Stars highlight |
| 4 | Enter comment: "ดีมาก" | Comment field populated |
| 5 | Click submit | Success: "ขอบคุณที่ใช้บริการ" |
| 6 | Verify redirect | Back to `/?pc_id=PC-01` |
| 7 | Verify PC status | `available` |
| 8 | Check database | CheckInLog created with rating & comment |

**Data Validation:**
- CheckInLog exists
- Duration calculated correctly
- Rating: 5
- Comment: "ดีมาก"

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKOUT-002: Checkout Without Rating
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/checkout/PC-01/` | Checkout page displays |
| 2 | Don't select rating (default: 5) | No rating selected |
| 3 | Click submit | Success |
| 4 | Check database | Rating = 5 (default) |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-CHECKOUT-003: Duration Calculation
**Prerequisites:** User checked in at 10:00 AM

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | System time: 10:30 AM | - |
| 2 | User clicks checkout | - |
| 3 | Check database | `duration_minutes` = 30 |
| 4 | Verify CSV export | Duration shows "0:30" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 4. Manager Dashboard

### TC-DASHBOARD-001: View All PC Status
**Prerequisites:** Logged in as admin, multiple PCs exist

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/dashboard/` | Dashboard displays |
| 2 | Verify stats cards | Total, Available, Occupied, Maintenance counts correct |
| 3 | Verify PC grid | All PCs display with correct status colors |
| 4 | Check available PC (green) | Shows "ว่าง" |
| 5 | Check in-use PC (red) | Shows username and time |
| 6 | Check disabled PC (gray) | Shows "งดให้บริการ" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-DASHBOARD-002: Auto Refresh
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/dashboard/` | Dashboard displays |
| 2 | Wait 30 seconds | Page auto-refreshes |
| 3 | Verify console | No JavaScript errors |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-DASHBOARD-003: Real-time Status Update
**Prerequisites:** PC-01 is available

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open dashboard | PC-01 shows "ว่าง" |
| 2 | User checks in to PC-01 (different browser) | - |
| 3 | Wait for auto-refresh (30s) or manual refresh | PC-01 shows "ใช้งาน" with username |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 5. Computer Management

### TC-MANAGE-001: Add New Computer
**Prerequisites:** Logged in, PC-10 doesn't exist

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/manage/` | Manage page displays |
| 2 | Click "เพิ่มเครื่อง" | Modal appears |
| 3 | Enter PC ID: `PC-10` | Field populated |
| 4 | Select status: "ว่าง" | Dropdown selected |
| 5 | Click "เพิ่มเครื่อง" | Success: "เพิ่มเครื่อง PC-10 สำเร็จ" |
| 6 | Verify table | PC-10 appears in list |
| 7 | Check database | Computer & Status records created |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-MANAGE-002: Add Duplicate PC ID
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "เพิ่มเครื่อง" | Modal appears |
| 2 | Enter existing PC ID: `PC-01` | Field populated |
| 3 | Click submit | Error: "PC ID PC-01 มีอยู่แล้ว" |
| 4 | Verify database | No duplicate created |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-MANAGE-003: Edit Computer - Change PC ID
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/manage/` | Manage page displays |
| 2 | Find PC-01, click "แก้ไข" | Row enters edit mode |
| 3 | Change PC ID to: `PC-01-NEW` | Field updated |
| 4 | Click "บันทึก" | Success message |
| 5 | Verify table | PC-01-NEW appears |
| 6 | Check database | pc_id updated |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-MANAGE-004: Edit Computer - Change Status (Available → Disabled)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | PC-01 is `available` | - |
| 2 | Click "แก้ไข" | Edit mode |
| 3 | Change status to "ซ่อม" | Dropdown changed |
| 4 | Click "บันทึก" | Success |
| 5 | Verify status | Shows "ซ่อม" badge |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-MANAGE-005: Delete Computer
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/manage/` | Manage page displays |
| 2 | Find PC-10, click delete icon | Confirmation dialog |
| 3 | Click "ลบเครื่อง" | Success: "ลบสำเร็จ" |
| 4 | Verify table | PC-10 removed |
| 5 | Check database | Computer & Status deleted |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 6. Status Change with Staff Authentication

### TC-STAFFAUTH-001: Change Available → In Use (Manage Page) - Success
**Prerequisites:** PC-01 is available, valid staff ID

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/manage/` | Manage page displays |
| 2 | Click "แก้ไข" on PC-01 | Edit mode |
| 3 | Change status to "ใช้งาน" | Dropdown changed |
| 4 | Click "บันทึก" | Modal: "กรุณากรอกรหัสเจ้าหน้าที่" |
| 5 | Enter staff ID: `teacher001` | Field populated |
| 6 | Click "ยืนยัน" | API call to reg_api |
| 7 | Verify success | Message: "เปลี่ยนสถานะเป็น 'ใช้งาน' สำเร็จ (ผู้ใช้: ชื่อ)" |
| 8 | Check database | Status = `in_use`, user info saved |

**Data Validation:**
- `current_user_type` = 'staff'
- `current_user_id` = 'teacher001'
- `current_user_name` populated
- `start_time` = current timestamp

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-STAFFAUTH-002: Change Available → In Use - Invalid Staff ID
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | PC-01 is available | - |
| 2 | Click "แก้ไข", change to "ใช้งาน" | - |
| 3 | Click "บันทึก" | Modal appears |
| 4 | Enter invalid ID: `invalid123` | Field populated |
| 5 | Click "ยืนยัน" | Error: "ไม่สามารถเปลี่ยนสถานะได้: ไม่พบข้อมูล" |
| 6 | Check status | Still `available` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-STAFFAUTH-003: Change Available → In Use - Empty Staff ID
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Modal appears | - |
| 2 | Leave staff ID field empty | - |
| 3 | Click "ยืนยัน" | Validation: "กรุณากรอกรหัสเจ้าหน้าที่" |
| 4 | Modal doesn't close | Still on modal |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-STAFFAUTH-004: Change Available → In Use (Dashboard) - Success
**Prerequisites:** PC-01 is available

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/dashboard/` | Dashboard displays |
| 2 | Click on PC-01 (green card) | Modal: "กรุณากรอกรหัสเจ้าหน้าที่" |
| 3 | Enter staff ID: `teacher002` | Field populated |
| 4 | Click "ยืนยัน" | Success message |
| 5 | Page reloads | PC-01 shows "ใช้งาน" (red) |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-STAFFAUTH-005: Change Disabled → Available (No Auth Required)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | PC-01 is `disabled` | - |
| 2 | Click PC-01 in dashboard | Confirmation: "เปิดใช้งาน?" |
| 3 | Click "เปิดใช้งาน" | NO staff ID modal |
| 4 | Verify success | Status = `available` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-STAFFAUTH-006: Change In Use → Disabled (Force Checkout)
**Prerequisites:** PC-01 in use by student

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Dashboard, click PC-01 (red) | Confirmation dialog |
| 2 | Click "ปิดเครื่อง" | Warning: "ผู้ใช้งาน... จะถูก checkout" |
| 3 | Click "ยืนยัน Checkout และอัปเดต" | Success |
| 4 | Check database | CheckInLog created, Status = `disabled` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 7. Software Management

### TC-SOFTWARE-001: Add Software
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/software/` | Software page displays |
| 2 | Click "เพิ่ม Software" | Modal appears |
| 3 | Enter name: `Adobe Photoshop` | Field populated |
| 4 | Enter version: `2024` | Field populated |
| 5 | Click submit | Success |
| 6 | Verify table | Software appears |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-SOFTWARE-002: Install Software to PC
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/manage/` | Manage page displays |
| 2 | Select PC: `PC-01` | Dropdown selected |
| 3 | Select Software: `Adobe Photoshop 2024` | Dropdown selected |
| 4 | Click "บันทึกการเปลี่ยนแปลง" | Success |
| 5 | Verify PC-01 row | Shows software name |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-SOFTWARE-003: Install Software to All PCs
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Select PC: `ทุกเครื่อง (All)` | Dropdown selected |
| 2 | Select Software | - |
| 3 | Click submit | Success for all PCs |
| 4 | Verify | All PCs show software |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 8. Report & Export

### TC-REPORT-001: View Reports
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/report/` | Report page displays |
| 2 | Verify table | Shows latest 50 logs |
| 3 | Check columns | PC ID, User Type, Name, Duration, Rating, etc. |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-REPORT-002: Export to CSV
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to `/manager/report/` | Report page displays |
| 2 | Click "Export CSV" | File download starts |
| 3 | Open CSV file | All logs exported |
| 4 | Verify encoding | Thai characters display correctly (UTF-8 BOM) |
| 5 | Check columns | All fields present |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-REPORT-003: CSV Duration Format
**Prerequisites:** Log with 90 minutes duration

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Export CSV | - |
| 2 | Find 90-minute record | - |
| 3 | Check Duration column | Shows "90" |
| 4 | Check Duration (Hours:Minutes) | Shows "1:30" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 9. API Endpoints

### TC-API-001: Toggle Status API (Available → Disabled)
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | PC-01 is `available` | - |
| 2 | POST `/api/toggle-status/PC-01/` | - |
| 3 | Check response | JSON: success=true |
| 4 | Check status | Changed to `disabled` |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-API-002: Update Computer API - Without Staff ID
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | POST `/api/update-computer/PC-01/` | - |
| 2 | Body: `status=in_use` (no staff_id) | - |
| 3 | Check response | Error: "กรุณากรอกรหัสเจ้าหน้าที่" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-API-003: API Without Authentication
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Logout | - |
| 2 | POST `/api/add-computer/` | - |
| 3 | Check response | 302 Redirect to login |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## 10. Edge Cases & Error Handling

### TC-EDGE-001: Concurrent Check-in
**Prerequisites:** 2 users trying to check-in to PC-01 simultaneously

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User A starts check-in | Form loads |
| 2 | User B starts check-in | Form loads |
| 3 | User A submits first | Success |
| 4 | User B submits | Error: "เครื่อง PC-01 ไม่ว่างในขณะนี้" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-EDGE-002: API Timeout
**Prerequisites:** Mock reg_api to timeout

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter student ID | - |
| 2 | Submit form | Wait... |
| 3 | After 10s | Error: "หมดเวลาการเชื่อมต่อ API (Timeout)" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-EDGE-003: Network Error During Check-in
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Disconnect network | - |
| 2 | Try to check-in | Error: "ไม่สามารถเชื่อมต่อกับ API ได้" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-EDGE-004: Very Long Session (24+ hours)
**Prerequisites:** User checked in 25 hours ago

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User clicks checkout | - |
| 2 | Check duration | Calculates correctly (1500 minutes) |
| 3 | CSV export | Shows "25:00" |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-EDGE-005: XSS Prevention
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter name: `<script>alert('XSS')</script>` | - |
| 2 | Submit form | Saves to database |
| 3 | View in dashboard | Displays as text, not executed |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

### TC-EDGE-006: SQL Injection Prevention
| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter PC ID: `PC-01'; DROP TABLE core_computer; --` | - |
| 2 | Submit | No SQL injection occurs |
| 3 | Check database | Table still exists |

**Status:** ✅ Pass / ❌ Fail / ⏸️ Skip

---

## Test Summary Template

| Category | Total | Pass | Fail | Skip | Pass Rate |
|----------|-------|------|------|------|-----------|
| Authentication | 6 | | | | % |
| Check-in | 6 | | | | % |
| Check-out | 3 | | | | % |
| Dashboard | 3 | | | | % |
| Management | 5 | | | | % |
| Staff Auth | 6 | | | | % |
| Software | 3 | | | | % |
| Report | 3 | | | | % |
| API | 3 | | | | % |
| Edge Cases | 6 | | | | % |
| **TOTAL** | **44** | | | | **%** |

---

**Test Date:** _________________

**Tester:** _________________

**Environment:** _________________

**Database:** SQLite / MySQL

**Browser:** Chrome / Firefox / Edge / Safari

**Version:** _________________
