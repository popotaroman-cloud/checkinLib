# 🔐 Staff Authentication for Status Change Update

## สรุปการเปลี่ยนแปลง

เพิ่มระบบตรวจสอบตัวตนเจ้าหน้าที่เมื่อต้องการเปลี่ยนสถานะเครื่องจาก **"ว่าง" (available)** เป็น **"ใช้งาน" (in_use)** ในหน้า:
- ✅ **Manager/Manage** - หน้าจัดการเครื่องคอมพิวเตอร์
- ✅ **Manager/Dashboard** - หน้าภาพรวมสถานะ

---

## 🎯 วัตถุประสงค์

เพื่อป้องกันการเปลี่ยนสถานะเครื่องเป็น "ใช้งาน" โดยไม่มีผู้ใช้จริง และเพื่อบันทึกข้อมูลเจ้าหน้าที่ที่เข้าใช้งานเครื่องอย่างถูกต้อง

---

## 🔄 Flow การทำงาน

### กรณีที่ 1: เปลี่ยนสถานะจาก "ว่าง" → "ใช้งาน"

```
Admin กดเปลี่ยนสถานะ (available → in_use)
         ↓
แสดง Modal ให้กรอกรหัสเจ้าหน้าที่
         ↓
     กรอกรหัส
         ↓
   เรียก reg_api(staff_id)
         ↓
┌─────────────────────────────┐
│ API Success                 │
│ - year > 0: นักศึกษา        │ → บันทึกข้อมูลลง Status
│ - year = 0: บุคลากร        │    - current_user_type
│                             │    - current_user_name
│                             │    - faculty
└─────────────────────────────┘    - start_time
         ↓
  เปลี่ยนสถานะสำเร็จ
  แสดงชื่อผู้ใช้

┌─────────────────────────────┐
│ API Failed                  │
│ - ไม่พบข้อมูล               │ → แสดง Error Message
│ - รหัสไม่ถูกต้อง            │    "ไม่สามารถเปลี่ยนสถานะได้"
└─────────────────────────────┘
```

### กรณีที่ 2: เปลี่ยนสถานะอื่นๆ

- **"ว่าง" → "ซ่อม"**: ไม่ต้องกรอกรหัส
- **"ใช้งาน" → "ว่าง"**: ต้อง confirm checkout ก่อน (force checkout)
- **"ใช้งาน" → "ซ่อม"**: ต้อง confirm checkout ก่อน
- **"ซ่อม" → "ว่าง"**: ไม่ต้องกรอกรหัส

---

## 📄 ไฟล์ที่แก้ไข

### 1. [templates/manager/manage.html](templates/manager/manage.html#L280-L343)

**เพิ่ม Logic ตรวจสอบก่อนบันทึก**

```javascript
// ตรวจสอบว่าเปลี่ยนจาก available เป็น in_use หรือไม่
const originalStatus = statusSelect.getAttribute('data-original');

if (originalStatus === 'available' && newStatus === 'in_use') {
    // ต้องกรอกรหัสเจ้าหน้าที่
    Swal.fire({
        title: 'เปลี่ยนสถานะเป็น "ใช้งาน"',
        html: `
            <div style="text-align: left; padding: 0 20px;">
                <p style="margin-bottom: 15px; color: #666;">กรุณากรอกรหัสเจ้าหน้าที่เพื่อยืนยันตัวตน</p>
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">รหัสเจ้าหน้าที่ <span style="color: red;">*</span></label>
                <input id="staff_id" class="swal2-input" placeholder="รหัสพนักงาน" style="margin: 0; width: 100%;" autofocus>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        confirmButtonColor: '#28a745',
        cancelButtonText: 'ยกเลิก',
        preConfirm: () => {
            const staffId = document.getElementById('staff_id').value.trim();

            if (!staffId) {
                Swal.showValidationMessage('กรุณากรอกรหัสเจ้าหน้าที่');
                return false;
            }

            return staffId;
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            const staffId = result.value;
            // ส่งข้อมูลพร้อมรหัสเจ้าหน้าที่
            sendUpdateRequest(false, staffId);
        }
    });
    return;
}
```

**อัปเดต sendUpdateRequest เพื่อรับ staffId**

```javascript
const sendUpdateRequest = (forceCheckout = false, staffId = null) => {
    const params = {
        'new_pc_id': newPcId,
        'status': newStatus,
        'force_checkout': forceCheckout ? 'true' : 'false'
    };

    if (staffId) {
        params['staff_id'] = staffId;
    }

    fetch(`/api/update-computer/${pcId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken
        },
        body: new URLSearchParams(params)
    })
    // ... handle response
}
```

---

### 2. [templates/manager/dashboard.html](templates/manager/dashboard.html#L125-L264)

**แก้ไข confirmToggle() function**

```javascript
function confirmToggle(pcId, currentStatus) {
    let newStatus = '';
    let action = '';

    if (currentStatus === 'disabled') {
        newStatus = 'available';
        action = 'เปิดใช้งาน (Available)';
    } else if (currentStatus === 'available') {
        newStatus = 'in_use';
        action = 'เปลี่ยนเป็น "ใช้งาน"';
    } else {
        newStatus = 'disabled';
        action = 'ปิดปรับปรุง (Maintenance)';
    }

    // ถ้าเป็นการเปลี่ยนจาก available เป็น in_use ต้องกรอกรหัสเจ้าหน้าที่
    if (currentStatus === 'available' && newStatus === 'in_use') {
        Swal.fire({
            title: `${action} - ${pcId}`,
            html: `
                <div style="text-align: left; padding: 0 20px;">
                    <p style="margin-bottom: 15px; color: #666;">กรุณากรอกรหัสเจ้าหน้าที่เพื่อยืนยันตัวตน</p>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">รหัสเจ้าหน้าที่ <span style="color: red;">*</span></label>
                    <input id="staff_id" class="swal2-input" placeholder="รหัสพนักงาน" style="margin: 0; width: 100%;" autofocus>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            // ... validation
        }).then((result) => {
            if (result.isConfirmed) {
                const staffId = result.value;
                updateComputerStatus(pcId, newStatus, false, staffId);
            }
        });
    } else {
        // กรณีอื่นๆ แสดง confirmation dialog ธรรมดา
        Swal.fire({
            title: `จัดการเครื่อง ${pcId}?`,
            text: `คุณต้องการ "${action}" ใช่หรือไม่?`,
            // ...
        }).then((result) => {
            if (result.isConfirmed) {
                updateComputerStatus(pcId, newStatus, false, null);
            }
        });
    }
}
```

**เพิ่ม updateComputerStatus() function**

```javascript
function updateComputerStatus(pcId, newStatus, forceCheckout = false, staffId = null) {
    const params = {
        'new_pc_id': pcId,
        'status': newStatus,
        'force_checkout': forceCheckout ? 'true' : 'false'
    };

    if (staffId) {
        params['staff_id'] = staffId;
    }

    fetch(`/api/update-computer/${pcId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken
        },
        body: new URLSearchParams(params)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // แสดง success message
            location.reload();
        } else if (data.require_confirmation) {
            // แสดง force checkout confirmation
        } else {
            // แสดง error message
        }
    });
}
```

---

### 3. [core/views.py](core/views.py#L486-L558) - `update_computer()` API

**เพิ่มการตรวจสอบรหัสเจ้าหน้าที่**

```python
@require_POST
def update_computer(request, pc_id):
    """API สำหรับอัปเดตข้อมูลเครื่องคอมพิวเตอร์"""
    try:
        computer = get_object_or_404(Computer, pc_id=pc_id)
        status_obj = computer.status_info

        # รับข้อมูลจาก request
        new_pc_id = request.POST.get('new_pc_id', '').strip()
        new_status = request.POST.get('status', status_obj.status)
        staff_id = request.POST.get('staff_id', '').strip()

        # ตรวจสอบการเปลี่ยนสถานะจาก "available" เป็น "in_use"
        if status_obj.status == 'available' and new_status == 'in_use':
            if not staff_id:
                return JsonResponse({'success': False, 'message': 'กรุณากรอกรหัสเจ้าหน้าที่'})

            # เรียก reg_api เพื่อตรวจสอบรหัสเจ้าหน้าที่
            info = reg_api(staff_id)

            if not info.get('success'):
                return JsonResponse({
                    'success': False,
                    'message': f'ไม่สามารถเปลี่ยนสถานะได้: {info.get("error", "ไม่พบข้อมูลเจ้าหน้าที่ในระบบ")}'
                })

            # ถ้าพบข้อมูล ให้บันทึกข้อมูลเจ้าหน้าที่ลง Status
            year = info.get('year', 0)

            # กำหนด user_type ตาม year
            if year and year > 0:
                user_type = 'student'
                year_val = year
                edu_level_val = info.get('level', 'ปริญญาตรี')
            else:
                user_type = 'staff'
                year_val = None
                edu_level_val = None

            # อัปเดต Status ด้วยข้อมูลเจ้าหน้าที่
            status_obj.status = 'in_use'
            status_obj.current_user_type = user_type
            status_obj.current_user_id = staff_id
            status_obj.current_user_name = info['name']
            status_obj.faculty = info.get('faculty')
            status_obj.year_level = year_val
            status_obj.education_level = edu_level_val
            status_obj.organization = None
            status_obj.start_time = timezone.now()
            status_obj.save()

            return JsonResponse({
                'success': True,
                'message': f'เปลี่ยนสถานะเป็น "ใช้งาน" สำเร็จ (ผู้ใช้: {info["name"]})'
            })

        # ... ส่วนอื่นๆ ของ function (ไม่เปลี่ยนแปลง)
```

---

## 🧪 การทดสอบ

### Test Case 1: เปลี่ยนสถานะจาก "ว่าง" → "ใช้งาน" (Success)

**ขั้นตอน:**
1. เข้าหน้า `/manager/manage/` หรือ `/manager/dashboard/`
2. คลิกปุ่ม "แก้ไข" หรือคลิกที่เครื่องที่มีสถานะ "ว่าง"
3. เปลี่ยนสถานะเป็น "ใช้งาน"
4. กรอกรหัสเจ้าหน้าที่ที่ถูกต้อง (เช่น `teacher001`)
5. กดยืนยัน

**Expected:**
- เรียก reg_api สำเร็จ
- บันทึกข้อมูลลง Status:
  - `current_user_type = 'staff'`
  - `current_user_name = 'ชื่อเจ้าหน้าที่'`
  - `faculty = 'คณะ/หน่วยงาน'`
  - `start_time = เวลาปัจจุบัน`
- แสดงข้อความ: "เปลี่ยนสถานะเป็น 'ใช้งาน' สำเร็จ (ผู้ใช้: ชื่อเจ้าหน้าที่)"
- รีโหลดหน้าและแสดงสถานะ "ใช้งาน"

---

### Test Case 2: เปลี่ยนสถานะจาก "ว่าง" → "ใช้งาน" (Failed - รหัสไม่ถูกต้อง)

**ขั้นตอน:**
1. เข้าหน้า `/manager/manage/`
2. เปลี่ยนสถานะเป็น "ใช้งาน"
3. กรอกรหัสเจ้าหน้าที่ที่ไม่มีในระบบ (เช่น `invalidcode`)
4. กดยืนยัน

**Expected:**
- เรียก reg_api ไม่สำเร็จ
- แสดง Error Message: "ไม่สามารถเปลี่ยนสถานะได้: ไม่พบข้อมูลเจ้าหน้าที่ในระบบ"
- สถานะไม่เปลี่ยน ยังคงเป็น "ว่าง"

---

### Test Case 3: เปลี่ยนสถานะจาก "ว่าง" → "ใช้งาน" (Failed - ไม่กรอกรหัส)

**ขั้นตอน:**
1. เข้าหน้า `/manager/dashboard/`
2. คลิกที่เครื่อง "ว่าง"
3. Modal แสดงให้กรอกรหัส
4. ไม่กรอกรหัส กดยืนยันเลย

**Expected:**
- แสดง Validation Message: "กรุณากรอกรหัสเจ้าหน้าที่"
- Modal ไม่ปิด
- ไม่ส่ง request ไปยัง backend

---

### Test Case 4: เปลี่ยนสถานะอื่นๆ (ไม่ต้องกรอกรหัส)

**ขั้นตอน:**
1. เปลี่ยนสถานะจาก "ซ่อม" → "ว่าง"

**Expected:**
- ไม่แสดง Modal ให้กรอกรหัส
- แสดง confirmation dialog ธรรมดา
- เปลี่ยนสถานะสำเร็จทันที

---

## 📊 Database Impact

**ไม่มีการเปลี่ยนแปลง Database Schema**

ตาราง `core_status` เก็บข้อมูลเหมือนเดิม:
- `status`: 'available', 'in_use', 'disabled'
- `current_user_type`: 'student', 'staff', 'external'
- `current_user_id`: รหัสผู้ใช้
- `current_user_name`: ชื่อผู้ใช้
- `faculty`: คณะ/หน่วยงาน
- `year_level`: ชั้นปี (สำหรับนักศึกษา)
- `start_time`: เวลาเริ่มใช้งาน

---

## 🔑 Key Points

1. **Security**: ป้องกันการเปลี่ยนสถานะเป็น "ใช้งาน" โดยไม่มีผู้ใช้จริง
2. **Traceability**: บันทึกข้อมูลเจ้าหน้าที่ที่เข้าใช้งานเครื่องอย่างถูกต้อง
3. **API Validation**: ใช้ reg_api ตรวจสอบความถูกต้องของรหัสเจ้าหน้าที่
4. **User Experience**: แสดง Modal ที่ชัดเจนและมี validation
5. **Backward Compatible**: ไม่กระทบการเปลี่ยนสถานะอื่นๆ

---

## 🚀 การใช้งาน

### หน้า Manager/Manage

1. Login ด้วย admin account
2. ไป `/manager/manage/`
3. คลิก "แก้ไข" ที่เครื่องที่ต้องการ
4. เปลี่ยน Status Dropdown เป็น "ใช้งาน"
5. กด "บันทึก"
6. Modal จะขึ้นให้กรอกรหัสเจ้าหน้าที่
7. กรอกรหัสและกดยืนยัน

### หน้า Manager/Dashboard

1. Login ด้วย admin account
2. ไป `/manager/dashboard/`
3. คลิกที่การ์ดเครื่องที่มีสถานะ "ว่าง" (สีเขียว)
4. Modal จะขึ้นให้กรอกรหัสเจ้าหน้าที่
5. กรอกรหัสและกดยืนยัน

---

## 📚 Related Documentation

- [CHECKIN_UPDATE.md](CHECKIN_UPDATE.md) - คู่มือ Check-in System Update
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - คู่มือ Authentication
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - คู่มือ Docker

---

**อัปเดตเมื่อ**: 2025-11-30
