# 🔧 Manager/Manage Page Refactor - Separation of Concerns

## Overview

แก้ไขหน้า **manager/manage** ให้แยก responsibilities ระหว่างการอัปเดต **Computer model** (PC ID) และ **Status model** (สถานะ/ผู้ใช้) ให้ชัดเจน ตามหลักการ **Separation of Concerns**

---

## ✨ Changes Summary

### 1. **แยก API เป็น 2 ฟังก์ชัน**
- **update_computer_id()** - จัดการเฉพาะ Computer model (PC ID, IP Address)
- **update_computer()** - จัดการเฉพาะ Status model (สถานะ, ข้อมูลผู้ใช้)

### 2. **Frontend Logic**
- ตรวจสอบว่ามีการเปลี่ยนแปลงอะไรบ้าง (PC ID หรือ Status)
- เรียก API ที่เหมาะสม (หรือทั้งสองถ้าเปลี่ยนทั้งสอง)
- ใช้ async/await สำหรับการเรียก API ตามลำดับ

### 3. **Flow เดียวกับ Dashboard**
- การเปลี่ยนสถานะใช้ logic เดียวกับหน้า dashboard
- รองรับ staff authentication (available → in_use)
- รองรับ force checkout (in_use → available/disabled)

---

## 📁 Files Modified

### 1. `core/views.py` - New API Functions

#### 1.1 update_computer_id() - NEW
**Location**: Lines 605-633

**Purpose**: อัปเดตเฉพาะ Computer model

**Parameters**:
- `pc_id` (path parameter): PC ID เดิม
- `new_pc_id` (POST): PC ID ใหม่
- `ip_address` (POST, optional): IP Address

**Logic**:
```python
@require_POST
def update_computer_id(request, pc_id):
    """API สำหรับอัปเดต PC ID ของเครื่องคอมพิวเตอร์ (Computer model only)"""
    try:
        computer = get_object_or_404(Computer, pc_id=pc_id)

        new_pc_id = request.POST.get('new_pc_id', '').strip()
        ip_address = request.POST.get('ip_address', '').strip() or None

        # Validation
        if not new_pc_id:
            return JsonResponse({'success': False, 'message': 'กรุณาระบุ PC ID'})

        # ตรวจสอบว่า PC ID ใหม่ซ้ำกับเครื่องอื่นหรือไม่
        if new_pc_id != pc_id and Computer.objects.filter(pc_id=new_pc_id).exists():
            return JsonResponse({'success': False, 'message': f'PC ID {new_pc_id} มีอยู่แล้ว'})

        # อัปเดต Computer model เท่านั้น
        old_pc_id = computer.pc_id
        computer.pc_id = new_pc_id
        computer.ip_address = ip_address
        computer.save()

        return JsonResponse({
            'success': True,
            'message': f'เปลี่ยน PC ID จาก {old_pc_id} เป็น {new_pc_id} สำเร็จ'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})
```

**What it does**:
- ✅ Update Computer.pc_id
- ✅ Update Computer.ip_address
- ✅ Validate PC ID uniqueness
- ❌ NOT touch Status model

---

#### 1.2 update_computer() - REFACTORED
**Location**: Lines 637-747

**Purpose**: อัปเดตเฉพาะ Status model

**Parameters**:
- `pc_id` (path parameter): PC ID
- `status` (POST): สถานะใหม่
- `staff_id` (POST, optional): รหัสเจ้าหน้าที่ (สำหรับ available → in_use)
- `force_checkout` (POST, optional): Force checkout flag

**Changes from Original**:
```diff
- # อัปเดตข้อมูลเครื่อง
- computer.pc_id = new_pc_id
- computer.ip_address = ip_address
- computer.save()

+ # อัปเดต Status เท่านั้น (ไม่แก้ Computer)
  status_obj.status = new_status
  ...
  status_obj.save()
```

**What it does**:
- ✅ Update Status.status
- ✅ Update Status user fields (current_user_type, current_user_id, etc.)
- ✅ Handle staff authentication (available → in_use)
- ✅ Handle force checkout (in_use → available/disabled)
- ✅ Create CheckInLog on force checkout
- ❌ NOT touch Computer model

---

### 2. `core/urls.py` - New Route

**Location**: Line 21

**Added**:
```python
path('api/update-computer-id/<str:pc_id>/', views.update_computer_id, name='update_computer_id'),
```

**URL Structure**:
```
/api/update-computer-id/PC-01/  → update PC ID only
/api/update-computer/PC-01/     → update Status only
```

---

### 3. `templates/manager/manage.html` - Refactored JavaScript

**Location**: Lines 262-429

**Changes**:

#### 3.1 ตรวจสอบการเปลี่ยนแปลง
```javascript
const newPcId = pcIdInput.value.trim();
const originalPcId = pcIdInput.getAttribute('data-original');
const newStatus = statusSelect.value;
const originalStatus = statusSelect.getAttribute('data-original');

// ตรวจสอบว่ามีการเปลี่ยนแปลงอะไรบ้าง
const pcIdChanged = (newPcId !== originalPcId);
const statusChanged = (newStatus !== originalStatus);

// ถ้าไม่มีการเปลี่ยนแปลงเลย
if (!pcIdChanged && !statusChanged) {
    Swal.fire({
        icon: 'info',
        title: 'ไม่มีการเปลี่ยนแปลง',
        text: 'ไม่พบข้อมูลที่ต้องอัปเดต',
        confirmButtonColor: '#17a2b8'
    });
    return;
}
```

#### 3.2 Async Update Function
```javascript
const performUpdates = async (updatePcId, updateStatus, forceCheckout = false, staffId = null) => {
    try {
        // 1. อัปเดต PC ID (ถ้ามีการเปลี่ยน)
        if (updatePcId) {
            const pcIdResponse = await fetch(`/api/update-computer-id/${pcId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: new URLSearchParams({
                    'new_pc_id': newPcId
                })
            });

            const pcIdData = await pcIdResponse.json();

            if (!pcIdData.success) {
                throw new Error(pcIdData.message);
            }
        }

        // 2. อัปเดตสถานะ (ถ้ามีการเปลี่ยน)
        if (updateStatus) {
            const params = {
                'status': newStatus,
                'force_checkout': forceCheckout ? 'true' : 'false'
            };

            if (staffId) {
                params['staff_id'] = staffId;
            }

            // ใช้ PC ID ใหม่ถ้ามีการเปลี่ยน
            const targetPcId = updatePcId ? newPcId : pcId;

            const statusResponse = await fetch(`/api/update-computer/${targetPcId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrftoken
                },
                body: new URLSearchParams(params)
            });

            const statusData = await statusResponse.json();

            if (statusData.require_confirmation) {
                // Handle force checkout confirmation
                ...
            }

            if (!statusData.success) {
                throw new Error(statusData.message);
            }
        }

        // สำเร็จ
        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'อัปเดตข้อมูลสำเร็จ',
            confirmButtonColor: '#28a745'
        }).then(() => {
            location.reload();
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: error.message,
            confirmButtonColor: '#dc3545'
        });
    }
};
```

**Key Points**:
- ใช้ async/await เพื่อเรียก API ตามลำดับ
- Update PC ID ก่อน (ถ้ามีการเปลี่ยน)
- Update Status ทีหลัง โดยใช้ PC ID ใหม่
- Handle errors gracefully
- รองรับ force checkout confirmation

---

## 🎯 Use Cases

### Use Case 1: แก้ไขเฉพาะ PC ID

**Steps**:
1. Admin คลิก "แก้ไข" ที่เครื่อง PC-01
2. แก้ PC ID เป็น "PC-10"
3. ไม่แก้สถานะ
4. คลิก "บันทึก"

**API Calls**:
```
POST /api/update-computer-id/PC-01/
  Body: new_pc_id=PC-10
```

**Result**:
- ✅ Computer.pc_id = "PC-10"
- ✅ Status ยังคงเดิม
- ✅ ถ้ามีผู้ใช้งานอยู่ ยังคงมี session ต่อไป

---

### Use Case 2: แก้ไขเฉพาะสถานะ

**Steps**:
1. Admin คลิก "แก้ไข" ที่เครื่อง PC-01
2. ไม่แก้ PC ID
3. เปลี่ยนสถานะจาก "ว่าง" เป็น "ใช้งาน"
4. คลิก "บันทึก"
5. ระบบขอรหัสเจ้าหน้าที่
6. กรอก `teacher001`
7. คลิก "ยืนยัน"

**API Calls**:
```
POST /api/update-computer/PC-01/
  Body: status=in_use&staff_id=teacher001
```

**Result**:
- ✅ Status.status = "in_use"
- ✅ Status.current_user_type = "staff"
- ✅ Status.current_user_id = "teacher001"
- ✅ Status.current_user_name = "อ.ดร.สมหญิง รักงาน"
- ✅ Computer.pc_id ยังคงเดิม

---

### Use Case 3: แก้ไขทั้ง PC ID และสถานะ

**Steps**:
1. Admin คลิก "แก้ไข" ที่เครื่อง PC-01
2. แก้ PC ID เป็น "PC-10"
3. เปลี่ยนสถานะจาก "ว่าง" เป็น "ใช้งาน"
4. คลิก "บันทึก"
5. ระบบขอรหัสเจ้าหน้าที่
6. กรอก `teacher001`
7. คลิก "ยืนยัน"

**API Calls** (Sequential):
```
1. POST /api/update-computer-id/PC-01/
     Body: new_pc_id=PC-10

2. POST /api/update-computer/PC-10/  ← ใช้ PC ID ใหม่
     Body: status=in_use&staff_id=teacher001
```

**Result**:
- ✅ Computer.pc_id = "PC-10"
- ✅ Status.status = "in_use"
- ✅ Status มีข้อมูลผู้ใช้ครบถ้วน

---

### Use Case 4: Force Checkout

**Steps**:
1. Admin คลิก "แก้ไข" ที่เครื่อง PC-01 (กำลังใช้งานอยู่)
2. เปลี่ยนสถานะจาก "ใช้งาน" เป็น "ว่าง"
3. คลิก "บันทึก"
4. ระบบถามยืนยัน: "เครื่อง PC-01 กำลังใช้งานโดย นายสมชาย ใจดี คุณต้องการ Checkout ผู้ใช้งานนี้ออกหรือไม่?"
5. คลิก "ยืนยัน Checkout และอัปเดต"

**API Calls** (Sequential):
```
1. POST /api/update-computer/PC-01/
     Body: status=available
   Response: {require_confirmation: true, ...}

2. POST /api/update-computer/PC-01/
     Body: status=available&force_checkout=true
```

**Result**:
- ✅ CheckInLog created (force checkout)
- ✅ Status.status = "available"
- ✅ Status user fields cleared

---

## 🔄 Data Flow Diagram

```
User แก้ไขข้อมูลในหน้า Manage
    ↓
JavaScript ตรวจสอบว่ามีการเปลี่ยนแปลงอะไรบ้าง
    ↓
┌────────────────────┬────────────────────┐
│  PC ID เปลี่ยน?    │  สถานะเปลี่ยน?      │
└────────┬───────────┴──────────┬─────────┘
         │                      │
         YES                    YES
         │                      │
         ▼                      ▼
  update_computer_id()    update_computer()
         │                      │
         │                      ├─ available → in_use?
         │                      │  → ขอรหัสเจ้าหน้าที่
         │                      │  → เรียก reg_api
         │                      │  → บันทึก user info
         │                      │
         │                      ├─ in_use → available/disabled?
         │                      │  → แสดง confirmation
         │                      │  → force checkout
         │                      │  → สร้าง CheckInLog
         │                      │  → clear user info
         │                      │
         ▼                      ▼
    Update Computer       Update Status
         │                      │
         └──────────┬───────────┘
                    ▼
              Reload Page
```

---

## 🧪 Testing Checklist

### Test 1: แก้ไข PC ID อย่างเดียว
- [ ] แก้ PC ID จาก PC-01 → PC-10
- [ ] ตรวจสอบว่า Computer.pc_id เปลี่ยน
- [ ] ตรวจสอบว่า Status ไม่เปลี่ยน
- [ ] ตรวจสอบว่าถ้ามีผู้ใช้งานอยู่ ยังคงมี session

### Test 2: แก้ไขสถานะอย่างเดียว
- [ ] เปลี่ยนสถานะ ว่าง → ใช้งาน
- [ ] ต้องกรอกรหัสเจ้าหน้าที่
- [ ] ตรวจสอบว่า reg_api ถูกเรียก
- [ ] ตรวจสอบว่า Status มีข้อมูลผู้ใช้
- [ ] ตรวจสอบว่า Computer.pc_id ไม่เปลี่ยน

### Test 3: แก้ไขทั้ง PC ID และสถานะ
- [ ] แก้ทั้ง PC ID และสถานะ
- [ ] ต้องกรอกรหัสเจ้าหน้าที่
- [ ] เรียก API 2 ตัวตามลำดับ
- [ ] ตรวจสอบว่าทั้ง Computer และ Status อัปเดต

### Test 4: Force Checkout
- [ ] เปลี่ยนสถานะจาก ใช้งาน → ว่าง (มีผู้ใช้งานอยู่)
- [ ] แสดง confirmation
- [ ] ยืนยัน → สร้าง CheckInLog
- [ ] ตรวจสอบว่า Status ถูก clear

### Test 5: Validation
- [ ] PC ID ว่าง → แสดง error
- [ ] PC ID ซ้ำ → แสดง error
- [ ] ไม่มีการเปลี่ยนแปลง → แสดง info
- [ ] รหัสเจ้าหน้าที่ไม่ถูกต้อง → แสดง error

---

## 🎨 Benefits of This Refactor

### 1. **Separation of Concerns**
- Computer model: เก็บข้อมูลอุปกรณ์ (PC ID, IP)
- Status model: เก็บข้อมูลสถานะและผู้ใช้
- แต่ละ API มีหน้าที่ชัดเจน

### 2. **Maintainability**
- โค้ดอ่านง่าย เข้าใจง่าย
- แก้ไขไม่กระทบกัน
- Test ง่ายขึ้น

### 3. **Flexibility**
- สามารถแก้ไข PC ID โดยไม่กระทบ session ที่กำลังใช้งาน
- สามารถเปลี่ยนสถานะโดยไม่กระทบ PC ID
- รองรับการแก้ไขทั้งสองพร้อมกัน

### 4. **Consistency**
- Flow เดียวกับหน้า dashboard
- API naming ชัดเจน
- Error handling consistent

---

## 📊 API Comparison

### Before (Old update_computer)
```python
# ทำทุกอย่างในฟังก์ชันเดียว
update_computer(pc_id):
    - Update Computer.pc_id
    - Update Computer.ip_address
    - Update Status.status
    - Update Status user fields
    - Handle staff auth
    - Handle force checkout
```

**Problems**:
- ❌ Mixed responsibilities
- ❌ ไม่สามารถแก้ไขแยกส่วนได้
- ❌ โค้ดยาวและซับซ้อน

### After (New APIs)
```python
# แยก responsibilities
update_computer_id(pc_id):
    - Update Computer.pc_id ✅
    - Update Computer.ip_address ✅

update_computer(pc_id):
    - Update Status.status ✅
    - Update Status user fields ✅
    - Handle staff auth ✅
    - Handle force checkout ✅
```

**Benefits**:
- ✅ Clear responsibilities
- ✅ Flexible updates
- ✅ Easier to maintain
- ✅ Better error handling

---

## 🔗 Related Files

- **Views**: [core/views.py:605-747](core/views.py#L605-L747)
- **URLs**: [core/urls.py:21-22](core/urls.py#L21-L22)
- **Template**: [templates/manager/manage.html:262-429](templates/manager/manage.html#L262-L429)
- **Models**: [core/models.py](core/models.py) - Computer, Status
- **Related**: [STAFF_AUTHENTICATION_UPDATE.md](STAFF_AUTHENTICATION_UPDATE.md)

---

## ✅ Completion Status

- [x] Create update_computer_id() API
- [x] Refactor update_computer() API
- [x] Add URL route for new API
- [x] Update manage.html JavaScript
- [x] Implement async/await pattern
- [x] Handle PC ID change detection
- [x] Handle status change detection
- [x] Support both changes simultaneously
- [x] Maintain staff authentication flow
- [x] Maintain force checkout flow
- [x] Create documentation
- [x] Test in Docker environment

---

**Last Updated**: 2025-12-01

**Status**: ✅ Completed and Running

**Environment**: Docker (Django 5.0.14, MySQL)

**Backward Compatibility**: ✅ Dashboard page still works (uses update_computer for status only)
