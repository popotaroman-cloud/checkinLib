# การทดสอบระบบ - Test Results

## 🧪 Test Case 1: เพิ่มเครื่อง PC ผ่าน DataManager

### วิธีทดสอบ:
1. เปิด `file:///E:/FYPrj/checkinSys/prototype/test-add-pc.html`
2. กรอก PC ID: `PC-TEST`
3. กรอก Location: `Z9`
4. คลิก "Add Computer"

### ผลลัพธ์ที่คาดหวัง:
```
✅ Form submitted
✅ DataManager.addComputer() ถูกเรียก
✅ PC-TEST ถูกเพิ่มใน LocalStorage
✅ แสดงข้อความ "เพิ่มเครื่อง PC-TEST สำเร็จ"
✅ รายการด้านล่างแสดง PC-TEST
```

### Console Output ที่คาดหวัง:
```javascript
[DataManager] addComputer called with: {id: "PC-TEST", row: "Z", number: 9, ...}
[DataManager] Current computers count: 30
[DataManager] Creating new computer: {...}
[DataManager] Computer saved. New count: 31
```

---

## 🧪 Test Case 2: เพิ่มเครื่อง PC ผ่าน manage-pc.html

### วิธีทดสอบ:
1. เปิด `file:///E:/FYPrj/checkinSys/prototype/admin/manage-pc.html`
2. คลิก "+ เพิ่มเครื่องใหม่"
3. กรอก PC ID: `PC-100`
4. กรอก Location: `A10`
5. คลิก "บันทึก"
6. Refresh หน้า

### ผลลัพธ์ที่คาดหวัง:
```
✅ Modal ปิด
✅ แสดงข้อความ "เพิ่มเครื่อง PC-100 สำเร็จ"
✅ ตารางแสดง PC-100
✅ หลัง Refresh: PC-100 ยังคงอยู่ในตาราง
```

---

## 🧪 Test Case 3: ทดสอบผ่าน Console

### คำสั่งทดสอบ:

```javascript
// Test 1: ตรวจสอบว่า DataManager โหลดหรือไม่
console.log('DataManager available:', typeof DataManager !== 'undefined');

// Test 2: ดูข้อมูล PC ปัจจุบัน
const currentPCs = getComputers();
console.log('Current PCs:', currentPCs.length);

// Test 3: เพิ่ม PC ใหม่
try {
    const newPC = DataManager.addComputer({
        id: 'PC-999',
        row: 'Z',
        number: 99,
        location: 'Z99',
        status: 'available',
        specs: 'Console Test',
        software: []
    });
    console.log('✅ Add successful:', newPC);
} catch (error) {
    console.error('❌ Add failed:', error.message);
}

// Test 4: ตรวจสอบว่าบันทึกสำเร็จหรือไม่
const afterAdd = getComputers();
console.log('After add:', afterAdd.length);
console.log('PC-999 exists:', afterAdd.some(pc => pc.id === 'PC-999'));

// Test 5: ลบทิ้ง (cleanup)
try {
    DataManager.deleteComputer('PC-999');
    console.log('✅ Delete successful');
} catch (error) {
    console.error('❌ Delete failed:', error.message);
}
```

### ผลลัพธ์ที่คาดหวัง:
```
DataManager available: true
Current PCs: 30
[DataManager] addComputer called with: ...
✅ Add successful: {id: "PC-999", ...}
After add: 31
PC-999 exists: true
✅ Delete successful
```

---

## 🧪 Test Case 4: ตรวจสอบ LocalStorage

### วิธีทดสอบ:
1. เปิด DevTools (F12)
2. ไปที่ Application → Local Storage → `file://`
3. หา key: `computers`
4. ดูค่าของ key

### ผลลัพธ์ที่คาดหวัง:
```
✅ มี key "computers"
✅ value เป็น JSON array
✅ มีข้อมูล PC ทั้งหมด
✅ แต่ละ PC มี field: id, row, number, location, status, specs
```

---

## 🧪 Test Case 5: Complete User Flow

### วิธีทดสอบ:
1. เปิด `file:///E:/FYPrj/checkinSys/prototype/user/idle.html?pc=PC-001`
2. คลิก "เริ่มใช้งาน"
3. เลือก "นักศึกษา/บุคลากร"
4. กรอก Student ID: `6501001`
5. คลิก "ยืนยัน"
6. รอดู Timer
7. คลิก "เลิกใช้งาน"
8. ให้คะแนน 5 ดาว
9. กรอก Feedback: "ทดสอบระบบ"
10. คลิก "ส่งความคิดเห็น"

### ผลลัพธ์ที่คาดหวัง:
```
✅ แสดงข้อมูลนักศึกษา "สมชาย ใจดี"
✅ SessionManager.startNewSession() สำเร็จ
✅ Timer เริ่มนับ (00:00:01, 00:00:02, ...)
✅ PC-001 status = "occupied" ใน LocalStorage
✅ SessionManager.endCurrentSession() สำเร็จ
✅ บันทึก usage log พร้อม rating และ feedback
✅ PC-001 status กลับเป็น "available"
✅ กลับไปหน้า idle
```

---

## 📊 Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| DataManager.addComputer() | ⏳ รอทดสอบ | ใช้ test-add-pc.html |
| manage-pc.html Add PC | ⏳ รอทดสอบ | ตรวจสอบ LocalStorage หลัง Refresh |
| Console Direct Test | ⏳ รอทดสอบ | ทดสอบใน Console |
| LocalStorage Persistence | ⏳ รอทดสอบ | ตรวจสอบ DevTools → Application |
| Complete User Flow | ⏳ รอทดสอบ | ทดสอบ Check-in → Check-out |

---

## 🔧 วิธีแก้ไขถ้าพบปัญหา

### ปัญหา: PC ไม่ถูกบันทึก
**สาเหตุ:**
- LocalStorage ถูก disable
- Browser รองรับ `file://` แบบจำกัด

**วิธีแก้:**
1. ใช้ Live Server (VS Code Extension)
2. หรือรัน `python -m http.server 8000`
3. เปิดผ่าน `http://localhost:8000`

### ปัญหา: DataManager is not defined
**สาเหตุ:**
- ไฟล์ data-manager.js ไม่ได้ถูก load

**วิธีแก้:**
1. ตรวจสอบ `<script src="../js/data-manager.js"></script>`
2. ตรวจสอบ path ให้ถูกต้อง
3. ดู Console errors

### ปัญหา: แก้ไข PC แล้ว ID ซ้ำ
**สาเหตุ:**
- updateComputer() พยายามเปลี่ยน ID

**วิธีแก้:**
- ไม่ควรเปลี่ยน ID ตอน update
- หรือต้อง check ว่าไม่ซ้ำกับ PC อื่น (ยกเว้นตัวเอง)

---

## 📝 Test Checklist

- [ ] เปิด test-add-pc.html ได้
- [ ] DataManager พร้อมใช้งาน
- [ ] เพิ่ม PC สำเร็จ
- [ ] Refresh แล้ว PC ยังอยู่
- [ ] ลบ PC สำเร็จ
- [ ] แก้ไข PC สำเร็จ
- [ ] User check-in สำเร็จ
- [ ] Timer ทำงาน
- [ ] User check-out สำเร็จ
- [ ] Usage log ถูกบันทึก
