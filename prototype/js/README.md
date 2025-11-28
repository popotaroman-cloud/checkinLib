# JavaScript Documentation

ระบบเช็คอินคอมพิวเตอร์ - คู่มือการใช้งาน JavaScript Modules

## 📁 File Structure

```
prototype/js/
├── config.js              # Mock Data & Configuration
├── utils.js               # Utility Functions
├── data-manager.js        # Data Management (CRUD)
├── session-manager.js     # Session Management
├── admin-dashboard.js     # Admin Functions
├── usage-examples.js      # Usage Examples
└── README.md             # This file
```

---

## 📚 Modules Overview

### 1. `config.js`
**Mock Data และ Configuration**

```javascript
const CONFIG = {
  MAX_SESSION_TIME: 120,        // นาที
  WARNING_TIME: 10,             // นาที
  API_DELAY: 500,              // มิลลิวินาที
  STORAGE_KEYS: { ... }
};

const MOCK_DATA = {
  students: [...],              // 30 students
  externalUsers: [...],         // 15 users
  computers: [...],             // 30 PCs
  reservations: [...],          // 20 reservations
  usageLogs: [...],            // 100+ logs
  software: [...]              // 15 packages
};
```

**การใช้งาน:**
```javascript
// ดึง Mock Data
const students = MOCK_DATA.students;
const computers = MOCK_DATA.computers;

// ดึง Config
const maxTime = CONFIG.MAX_SESSION_TIME;
```

---

### 2. `utils.js`
**Utility Functions - ฟังก์ชันพื้นฐาน**

#### Navigation
```javascript
// ดึง URL parameters
const params = getURLParams();
const pcId = getURLParam('pc');

// Navigate ไปหน้าอื่น
navigateTo('active-session.html', { pc: 'PC-001', user: '6501001' });
```

#### LocalStorage Management
```javascript
// Session
saveCurrentSession(sessionData);
const session = getCurrentSession();
clearCurrentSession();

// Computers
const computers = getComputers();
saveComputers(computersArray);
const pc = getComputerById('PC-001');
updateComputerStatus('PC-001', 'occupied', { currentUser: '6501001' });

// Logs
const logs = getUsageLogs();
addUsageLog(logData);

// External Users
const externalUsers = getExternalUsers();
addExternalUser(userData);

// Reservations
const reservations = getReservations();
```

#### Student Functions
```javascript
// ค้นหานักศึกษา (Promise)
findStudentById('6501001')
  .then(student => console.log(student))
  .catch(error => console.error(error));

// ตรวจสอบการจอง
const reservation = checkReservation('6501001', 'PC-001');

// ตรวจสอบว่า PC ว่าง
const available = isPCAvailable('PC-001');
```

#### Validation
```javascript
// ตรวจสอบเลขบัตรประชาชน
const valid = validateNationalId('1234567890123');

// Format เลขบัตร
const formatted = formatNationalId('1234567890123');
// Result: "1-2345-67890-12-3"
```

#### Time Functions
```javascript
// คำนวณระยะเวลา (นาที)
const duration = calculateDuration(startTime, endTime);

// Format HH:MM:SS
const formatted = formatDuration(75); // "01:15:00"

// Format วันที่แบบไทย
const thaiDate = formatDateThai('2024-11-28T10:30:00');

// Format เวลา
const time = formatTime('2024-11-28T10:30:00');
```

#### Check-in/Check-out
```javascript
// เริ่ม Session
const session = startSession('PC-001', '6501001', 'internal', studentData);

// จบ Session
const log = endSession('PC-001', '6501001', 5, 'ดีมาก');

// Force Logout (Admin)
forceLogout('PC-001');
```

#### Statistics
```javascript
// สถิติ PC
const stats = getPCStatistics();
// { total, available, occupied, maintenance }

// สถิติวันนี้
const todayStats = getTodayStatistics();
// { totalUsers, totalDuration, averageRating }
```

#### UI Helpers
```javascript
// Loading
showLoading('กำลังโหลด...');
hideLoading();

// Alert
showAlert('บันทึกสำเร็จ', 'success');
showAlert('เกิดข้อผิดพลาด', 'danger');
```

#### Export
```javascript
// Export to CSV
exportToCSV(dataArray, 'export.csv');
```

---

### 3. `data-manager.js`
**Data Management - CRUD Operations**

#### Computer Management
```javascript
// เพิ่มเครื่อง PC
const newPC = DataManager.addComputer({
  id: 'PC-031',
  row: 'G',
  number: 1,
  specs: 'i7-12700, 32GB RAM, 1TB SSD',
  status: 'available'
});

// แก้ไข PC
const updated = DataManager.updateComputer('PC-001', {
  specs: 'i5-11400, 16GB RAM (Upgraded)',
  notes: 'อัพเกรด RAM'
});

// ลบ PC
DataManager.deleteComputer('PC-031');

// ตั้งค่า Maintenance
DataManager.setMaintenanceMode('PC-005', true, 'ซ่อมหน้าจอ');
DataManager.setMaintenanceMode('PC-005', false); // ปิด Maintenance
```

#### Software Management
```javascript
// ดึงรายการซอฟต์แวร์
const software = DataManager.getSoftwareList();

// เพิ่มซอฟต์แวร์
const newSW = DataManager.addSoftware({
  name: 'Visual Studio 2022',
  version: '17.8',
  category: 'Development',
  license: 'Educational'
});

// แก้ไขซอฟต์แวร์
DataManager.updateSoftware(1, { version: '2024' });

// ลบซอฟต์แวร์
DataManager.deleteSoftware(1);

// ติดตั้งซอฟต์แวร์ใน PC
DataManager.installSoftwareOnPC(1, 'PC-001');

// ถอนการติดตั้ง
DataManager.uninstallSoftwareFromPC(1, 'PC-001');
```

#### Reservation Management
```javascript
// เพิ่มการจอง
const reservation = DataManager.addReservation({
  studentId: '6501001',
  pcId: 'PC-010',
  date: '2024-11-28',
  time: '14:00',
  duration: 2,
  purpose: 'ทำโปรเจกต์'
});

// ยกเลิกการจอง
DataManager.cancelReservation(1);

// ทำการจองให้เสร็จสมบูรณ์
DataManager.completeReservation('6501001', 'PC-010');
```

#### External User Management
```javascript
// ค้นหาจากเลขบัตรประชาชน
const user = DataManager.findExternalUserByNationalId('1234567890123');

// อัพเดทข้อมูล
DataManager.updateExternalUser('ext-001', { phone: '0812345678' });
```

#### Usage Log Management
```javascript
// อัพเดท Log
DataManager.updateUsageLog(1, { rating: 5, feedback: 'ดีมาก' });

// ลบ Logs เก่า
const result = DataManager.cleanupOldLogs(30); // เก็บแค่ 30 วัน
// { before: 150, after: 100, deleted: 50 }

// Filter Logs
const logs = DataManager.getFilteredLogs({
  startDate: '2024-11-25T00:00:00',
  endDate: '2024-11-28T23:59:59',
  userType: 'internal',
  faculty: 'วิทยาศาสตร์',
  minRating: 4
});
```

#### Export/Import
```javascript
// Export ข้อมูลทั้งหมด
const backup = DataManager.exportAllData();
// ดาวน์โหลดไฟล์ JSON

// Import ข้อมูล
DataManager.importAllData(jsonData);

// Reset เป็น Mock Data
DataManager.resetToMockData();
```

#### Validation & Repair
```javascript
// ตรวจสอบข้อมูล
const validation = DataManager.validateData();
// { valid: false, issues: [...], issueCount: 2 }

// ซ่อมแซมข้อมูลอัตโนมัติ
const result = DataManager.repairData();
// { issuesFound: 2, fixed: 2 }
```

#### Action Logging
```javascript
// ดึง Action Logs (Audit Trail)
const actionLogs = DataManager.getActionLogs();
```

---

### 4. `session-manager.js`
**Session Management - จัดการ Session Real-time**

#### Start/End Session
```javascript
// เริ่ม Session
const session = SessionManager.startNewSession(
  'PC-001',              // pcId
  '6501001',            // userId
  'internal',           // userType
  studentData           // userData object
);

// จบ Session
const log = SessionManager.endCurrentSession(
  5,                    // rating (1-5)
  'ดีมาก ใช้งานสะดวก'  // feedback
);
```

#### Timer Management
```javascript
// เริ่มจับเวลา
SessionManager.startTimer((info) => {
  console.log('Elapsed:', info.elapsed.formatted);
  console.log('Remaining:', info.remaining.formatted);
  console.log('Near limit:', info.isNearLimit);
  console.log('Over limit:', info.isOverLimit);
});

// หยุดจับเวลา
SessionManager.stopTimer();
```

#### Time Tracking
```javascript
// เวลาที่ผ่านไป
const elapsedSeconds = SessionManager.getElapsedSeconds();
const elapsedMinutes = SessionManager.getElapsedMinutes();
const elapsedTime = SessionManager.getElapsedTime();
// { hours: 1, minutes: 15, seconds: 30, formatted: "01:15:30" }

// เวลาที่เหลือ
const remainingMinutes = SessionManager.getRemainingMinutes();
const remainingSeconds = SessionManager.getRemainingSeconds();
const remainingTime = SessionManager.getRemainingTime();
// { hours: 0, minutes: 45, seconds: 30, formatted: "00:45:30" }
```

#### Session Info
```javascript
// ตรวจสอบว่ามี Active Session หรือไม่
const hasSession = SessionManager.hasActiveSession();

// ดึงข้อมูล Session ปัจจุบัน
const info = SessionManager.getSessionInfo();
// {
//   sessionId, pcId, userId, userName, faculty,
//   elapsed: { ... },
//   remaining: { ... },
//   percentComplete: 50.5
// }
```

#### Special Features
```javascript
// ต่ออายุ Session (เพิ่มเวลา)
SessionManager.extendSession(30); // เพิ่ม 30 นาที

// ป้องกันการปิดหน้าต่างโดยไม่ Checkout
SessionManager.enableUnloadProtection();

// สถิติ Session
const stats = SessionManager.getSessionStatistics();
// {
//   totalSessionsToday, activeSessionsNow,
//   averageDurationToday, totalDurationToday,
//   averageRatingToday
// }
```

---

### 5. `admin-dashboard.js`
**Admin Functions**

#### Dashboard
```javascript
// Refresh Dashboard
refreshDashboardData();

// Auto-refresh ทุก 30 วินาที
initDashboardAutoRefresh(30000);
```

#### Monitor
```javascript
// PC ที่กำลังถูกใช้งาน พร้อมระยะเวลา
const occupiedPCs = getOccupiedPCsWithDuration();

// PC ตาม Status
const availablePCs = getPCsByStatus('available');
const occupiedPCs = getPCsByStatus('occupied');
const maintenancePCs = getPCsByStatus('maintenance');

// Toggle Maintenance
togglePCMaintenance('PC-005');
```

#### Statistics & Analytics
```javascript
// สถิติตามช่วงวันที่
const stats = getUsageStatsByDateRange('2024-11-25', '2024-11-28');
// { totalSessions, totalDuration, averageDuration, uniqueUsers, averageRating }

// การใช้งานแยกตามช่วงเวลา
const hourlyUsage = getUsageByHour();
// { 0: 0, 1: 0, ..., 14: 25, 15: 20, ... }

// การใช้งานแยกตามคณะ
const facultyUsage = getUsageByFaculty();
// { "วิทยาศาสตร์": 50, "วิศวกรรมศาสตร์": 40, ... }

// การใช้งานแยกตามประเภทผู้ใช้
const typeUsage = getUsageByUserType();
// { internal: 80, external: 20 }

// Peak Hours (3 ช่วงเวลาที่ใช้มากที่สุด)
const peakHours = getPeakUsageHours(3);
// [{ hour: "14:00", count: 25 }, ...]

// PC ที่ใช้มากที่สุด (Top 5)
const mostUsed = getMostUsedPCs(5);
// [{ pcId: "PC-015", count: 45, totalDuration: 2250 }, ...]

// Rating Distribution
const ratingDist = getRatingDistribution();
// { 1: 2, 2: 5, 3: 10, 4: 30, 5: 50 }
```

#### Reservation
```javascript
// Validate Reservation Data
const validation = validateReservationData(data);
// { valid: true/false, errors: [] }

// Add Reservation
const reservation = addReservation(reservationData);

// Import จาก CSV
const csv = "student_id,pc_id,date,time,duration,purpose\n6501001,PC-001,2024-11-28,14:00,2,ทำงาน";
const result = importReservationsFromCSV(csv);
// { success: 10, failed: 2, errors: [...] }
```

#### Utilities
```javascript
// Generate QR Code URL
const url = generateQRCodeURL('PC-001');

// Format Time สำหรับแสดงผล
const formatted = formatTimeForDisplay(75); // "1 ชั่วโมง 15 นาที"

// System Health
const health = getSystemHealth();
// {
//   health: 'good/fair/poor',
//   total, available, occupied, maintenance,
//   availablePercent, occupiedPercent, maintenancePercent
// }
```

#### Backup & Restore
```javascript
// Backup ข้อมูล
const backup = backupData();
// ดาวน์โหลดไฟล์ JSON

// Restore ข้อมูล
restoreData(jsonText);

// Clear Old Logs
const result = clearOldLogs(30); // เก็บแค่ 30 วัน
// { original: 150, remaining: 100, deleted: 50 }
```

---

### 6. `usage-examples.js`
**Usage Examples - ตัวอย่างการใช้งาน**

```javascript
// รันตัวอย่างใน Console
Examples.addComputer();
Examples.startSession();
Examples.getStatistics();
Examples.exportData();

// Workflow สมบูรณ์
Examples.completeWorkflow();
```

---

## 🎯 การใช้งานในหน้า HTML

### ตัวอย่าง: Login Internal
```html
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/session-manager.js"></script>
<script>
  function handleLogin(studentId) {
    showLoading('กำลังตรวจสอบ...');

    findStudentById(studentId)
      .then(student => {
        hideLoading();

        // แสดงข้อมูล
        document.getElementById('name').textContent = student.name;
        document.getElementById('faculty').textContent = student.faculty;

        // บันทึก session ชั่วคราว
        sessionStorage.setItem('pendingUser', JSON.stringify(student));

        showAlert('พบข้อมูลนักศึกษา', 'success');
      })
      .catch(error => {
        hideLoading();
        showAlert(error.error, 'danger');
      });
  }
</script>
```

### ตัวอย่าง: Active Session
```html
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/session-manager.js"></script>
<script>
  // ตรวจสอบ session
  if (!SessionManager.hasActiveSession()) {
    window.location.href = 'idle.html';
  }

  // แสดงข้อมูล
  const info = SessionManager.getSessionInfo();
  document.getElementById('userName').textContent = info.userName;
  document.getElementById('pcId').textContent = info.pcId;

  // เริ่มจับเวลา
  SessionManager.startTimer((info) => {
    document.getElementById('timer').textContent = info.elapsed.formatted;

    if (info.isNearLimit) {
      document.getElementById('timer').classList.add('text-danger');
    }
  });

  // ป้องกันการปิดหน้าต่าง
  SessionManager.enableUnloadProtection();
</script>
```

### ตัวอย่าง: Admin Monitor
```html
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/data-manager.js"></script>
<script src="../js/admin-dashboard.js"></script>
<script>
  function loadMonitor() {
    const computers = getComputers();
    const grid = document.getElementById('pcGrid');

    grid.innerHTML = computers.map(pc => `
      <div class="pc-card status-${pc.status}">
        <h3>${pc.id}</h3>
        <span class="badge badge-${pc.status}">${pc.status}</span>
        ${pc.status === 'occupied' ? `
          <p>${pc.currentUserName}</p>
          <p>เวลา: ${calculateDuration(pc.startTime)} นาที</p>
          <button onclick="forceLogout('${pc.id}')">Force Logout</button>
        ` : ''}
      </div>
    `).join('');
  }

  // Auto-refresh ทุก 10 วินาที
  setInterval(loadMonitor, 10000);
  loadMonitor();
</script>
```

---

## 🔧 Development Tips

### 1. Debug Mode
```javascript
// เปิด Debug Mode
localStorage.setItem('debug', 'true');

// ดู Console
console.log(SessionManager.getSessionInfo());
console.log(DataManager.getActionLogs());
```

### 2. Testing
```javascript
// ทดสอบบน Console
Examples.completeWorkflow();
DataManager.validateData();
SessionManager.getStatistics();
```

### 3. Data Management
```javascript
// Backup ก่อนทำงาน
DataManager.exportAllData();

// ซ่อมแซมข้อมูล
DataManager.repairData();

// Reset
DataManager.resetToMockData();
```

---

## 📖 Best Practices

1. **ตรวจสอบ Session เสมอ** ก่อนเข้าหน้า Active Session
2. **ใช้ try-catch** กับทุก DataManager operations
3. **Backup ข้อมูล** ก่อนทำ Import/Reset
4. **ตรวจสอบ Validation** ก่อนบันทึกข้อมูล
5. **ใช้ showLoading/hideLoading** กับ async operations
6. **Enable UnloadProtection** ในหน้า Active Session

---

## 🚀 Quick Reference

```javascript
// Check-in Flow
findStudentById(id)
  .then(student => SessionManager.startNewSession(...))
  .then(() => SessionManager.startTimer(...))

// Check-out Flow
SessionManager.endCurrentSession(rating, feedback)
  .then(() => navigateTo('idle.html'))

// Admin Operations
DataManager.addComputer(...)
DataManager.setMaintenanceMode(...)
DataManager.exportAllData()
```

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
1. เปิด Console (F12) ดู error messages
2. ทดสอบด้วย `Examples.xxxx()`
3. ตรวจสอบ `DataManager.validateData()`
4. ทำ `DataManager.repairData()` ถ้ามีปัญหา
