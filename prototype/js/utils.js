// ========================================
// Utility Functions
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

// ดึงค่า URL Parameters
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// ดึงค่า parameter เดียว
function getURLParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// Navigate ไปหน้าอื่นพร้อม parameters
function navigateTo(page, params = {}) {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const url = queryString ? `${page}?${queryString}` : page;
  window.location.href = url;
}

// ========================================
// Local Storage Functions
// ========================================

// บันทึก session ปัจจุบัน
function saveCurrentSession(data) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(data));
}

// ดึง session ปัจจุบัน
function getCurrentSession() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_SESSION);
  return data ? JSON.parse(data) : null;
}

// ลบ session ปัจจุบัน
function clearCurrentSession() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_SESSION);
}

// ดึงข้อมูลเครื่องคอมพิวเตอร์ทั้งหมด
function getComputers() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.COMPUTERS);
  return data ? JSON.parse(data) : MOCK_DATA.computers;
}

// บันทึกข้อมูลเครื่องคอมพิวเตอร์
function saveComputers(computers) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.COMPUTERS, JSON.stringify(computers));
}

// ดึงข้อมูลเครื่องคอมพิวเตอร์ตาม ID
function getComputerById(pcId) {
  const computers = getComputers();
  return computers.find(pc => pc.id === pcId);
}

// อัพเดทสถานะเครื่องคอมพิวเตอร์
function updateComputerStatus(pcId, status, additionalData = {}) {
  const computers = getComputers();
  const pcIndex = computers.findIndex(pc => pc.id === pcId);

  if (pcIndex !== -1) {
    computers[pcIndex] = {
      ...computers[pcIndex],
      status,
      ...additionalData
    };
    saveComputers(computers);
    return true;
  }
  return false;
}

// ดึง Usage Logs
function getUsageLogs() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.USAGE_LOGS);
  return data ? JSON.parse(data) : MOCK_DATA.usageLogs;
}

// เพิ่ม Usage Log
function addUsageLog(log) {
  const logs = getUsageLogs();
  const newLog = {
    id: logs.length + 1,
    ...log
  };
  logs.push(newLog);
  localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(logs));
  return newLog;
}

// ดึงข้อมูลบุคคลภายนอก
function getExternalUsers() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS);
  return data ? JSON.parse(data) : MOCK_DATA.externalUsers;
}

// เพิ่มบุคคลภายนอก
function addExternalUser(user) {
  const users = getExternalUsers();
  const newUser = {
    id: `ext-${String(users.length + 1).padStart(3, '0')}`,
    ...user,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS, JSON.stringify(users));
  return newUser;
}

// ดึงข้อมูลการจอง
function getReservations() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEYS.RESERVATIONS);
  return data ? JSON.parse(data) : MOCK_DATA.reservations;
}

// ========================================
// Student/User Functions
// ========================================

// ค้นหานักศึกษาจาก ID
function findStudentById(studentId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = MOCK_DATA.students.find(s => s.id === studentId);
      if (student) {
        resolve(student);
      } else {
        reject({ error: 'ไม่พบข้อมูลนักศึกษา/บุคลากรในระบบ' });
      }
    }, CONFIG.API_DELAY);
  });
}

// ตรวจสอบสิทธิ์การจอง
function checkReservation(studentId, pcId) {
  const reservations = getReservations();
  const today = new Date().toISOString().split('T')[0];

  return reservations.find(r =>
    r.studentId === studentId &&
    r.pcId === pcId &&
    r.date === today
  );
}

// ตรวจสอบว่า PC ว่างหรือไม่
function isPCAvailable(pcId) {
  const pc = getComputerById(pcId);
  return pc && pc.status === 'available';
}

// ========================================
// Validation Functions
// ========================================

// ตรวจสอบรูปแบบเลขบัตรประชาชน 13 หลัก
function validateNationalId(nationalId) {
  // ลบ - ออกก่อน
  const id = nationalId.replace(/-/g, '');

  // ตรวจสอบว่ามี 13 หลักและเป็นตัวเลขทั้งหมด
  if (!/^\d{13}$/.test(id)) {
    return false;
  }

  // ตรวจสอบ checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12));
}

// Format เลขบัตรประชาชนให้มี -
function formatNationalId(nationalId) {
  const id = nationalId.replace(/-/g, '');
  if (id.length === 13) {
    return `${id.substring(0, 1)}-${id.substring(1, 5)}-${id.substring(5, 10)}-${id.substring(10, 12)}-${id.substring(12, 13)}`;
  }
  return nationalId;
}

// ========================================
// Time Functions
// ========================================

// คำนวณระยะเวลาที่ผ่านไป (นาที)
function calculateDuration(startTime, endTime = null) {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end - start;
  return Math.floor(diffMs / 60000); // แปลงเป็นนาที
}

// Format ระยะเวลาเป็น HH:MM:SS
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = 0; // ถ้าต้องการนับวินาทีก็เพิ่มได้

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Format วันที่แบบไทย
function formatDateThai(dateString) {
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('th-TH', options);
}

// Format เวลา HH:MM
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

// ========================================
// UI Helper Functions
// ========================================

// แสดง Loading Overlay
function showLoading(message = 'กำลังโหลด...') {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading"></div>
      <p style="margin-top: 1rem;">${message}</p>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ซ่อน Loading Overlay
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

// แสดง Alert แบบสวยงาม
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '10000';
  alertDiv.style.minWidth = '300px';
  alertDiv.style.animation = 'slideIn 0.3s ease-out';

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

// ========================================
// Check-in/Check-out Functions
// ========================================

// เริ่ม Session (Check-in)
function startSession(pcId, userId, userType, userData) {
  const session = {
    pcId,
    userId,
    userType,
    userName: userData.name || `${userData.firstName} ${userData.lastName}`,
    faculty: userData.faculty || userData.organization || 'บุคคลภายนอก',
    startTime: new Date().toISOString()
  };

  // บันทึก session
  saveCurrentSession(session);

  // อัพเดทสถานะ PC
  updateComputerStatus(pcId, 'occupied', {
    currentUser: userId,
    startTime: session.startTime
  });

  return session;
}

// จบ Session (Check-out)
function endSession(pcId, userId, rating = null, feedback = null) {
  const session = getCurrentSession();

  if (!session || session.pcId !== pcId || session.userId !== userId) {
    throw new Error('Session ไม่ถูกต้อง');
  }

  const endTime = new Date().toISOString();
  const duration = calculateDuration(session.startTime, endTime);

  // บันทึก Usage Log
  const log = addUsageLog({
    userId: session.userId,
    userType: session.userType,
    userName: session.userName,
    faculty: session.faculty,
    pcId: session.pcId,
    startTime: session.startTime,
    endTime,
    duration,
    rating,
    feedback
  });

  // อัพเดทสถานะ PC กลับเป็น available
  updateComputerStatus(pcId, 'available', {
    currentUser: null,
    startTime: null
  });

  // ลบ session
  clearCurrentSession();

  return log;
}

// Force Logout (สำหรับ Admin)
function forceLogout(pcId) {
  const pc = getComputerById(pcId);

  if (pc && pc.status === 'occupied') {
    const endTime = new Date().toISOString();
    const duration = calculateDuration(pc.startTime, endTime);

    // บันทึก Log (ไม่มี rating/feedback)
    addUsageLog({
      userId: pc.currentUser,
      userType: 'unknown',
      userName: 'Unknown User',
      faculty: 'Unknown',
      pcId: pc.id,
      startTime: pc.startTime,
      endTime,
      duration,
      rating: null,
      feedback: 'Force logout by admin'
    });

    // อัพเดทสถานะ PC
    updateComputerStatus(pcId, 'available', {
      currentUser: null,
      startTime: null
    });

    return true;
  }

  return false;
}

// ========================================
// Statistics Functions
// ========================================

// สรุปสถิติ PC
function getPCStatistics() {
  const computers = getComputers();

  return {
    total: computers.length,
    available: computers.filter(pc => pc.status === 'available').length,
    occupied: computers.filter(pc => pc.status === 'occupied').length,
    maintenance: computers.filter(pc => pc.status === 'maintenance').length
  };
}

// สรุปสถิติการใช้งานวันนี้
function getTodayStatistics() {
  const logs = getUsageLogs();
  const today = new Date().toISOString().split('T')[0];

  const todayLogs = logs.filter(log => log.startTime.startsWith(today));

  return {
    totalUsers: todayLogs.length,
    totalDuration: todayLogs.reduce((sum, log) => sum + log.duration, 0),
    averageRating: todayLogs.filter(log => log.rating).length > 0
      ? (todayLogs.reduce((sum, log) => sum + (log.rating || 0), 0) / todayLogs.filter(log => log.rating).length).toFixed(1)
      : 0
  };
}

// Export to CSV
function exportToCSV(data, filename = 'export.csv') {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
