// ========================================
// Usage Examples - ตัวอย่างการใช้งาน
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

/**
 * ไฟล์นี้แสดงตัวอย่างการใช้งาน DataManager และ SessionManager
 * สามารถเปิด Developer Console และรันตัวอย่างได้เลย
 */

// ========================================
// 1. การจัดการเครื่องคอมพิวเตอร์
// ========================================

function exampleAddComputer() {
  try {
    const newPC = DataManager.addComputer({
      id: 'PC-031',
      row: 'G',
      number: 1,
      specs: 'i7-12700, 32GB RAM, 1TB SSD',
      status: 'available',
      notes: 'เครื่องใหม่'
    });

    console.log('✅ เพิ่มเครื่อง PC สำเร็จ:', newPC);
    showAlert('เพิ่มเครื่อง PC-031 สำเร็จ', 'success');
    return newPC;

  } catch (error) {
    console.error('❌ เพิ่มเครื่อง PC ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleUpdateComputer() {
  try {
    const updated = DataManager.updateComputer('PC-001', {
      specs: 'i5-11400, 16GB RAM, 512GB SSD (Upgraded)',
      notes: 'อัพเกรด RAM และ SSD'
    });

    console.log('✅ อัพเดทเครื่อง PC สำเร็จ:', updated);
    showAlert('อัพเดท PC-001 สำเร็จ', 'success');
    return updated;

  } catch (error) {
    console.error('❌ อัพเดทเครื่อง PC ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleSetMaintenance() {
  try {
    const pc = DataManager.setMaintenanceMode('PC-005', true, 'ซ่อมหน้าจอ');

    console.log('✅ ตั้งค่า Maintenance สำเร็จ:', pc);
    showAlert('ตั้งค่า PC-005 เป็น Maintenance', 'warning');
    return pc;

  } catch (error) {
    console.error('❌ ตั้งค่า Maintenance ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

// ========================================
// 2. การจัดการซอฟต์แวร์
// ========================================

function exampleAddSoftware() {
  try {
    const software = DataManager.addSoftware({
      name: 'Visual Studio 2022',
      version: '17.8',
      category: 'Development',
      license: 'Educational'
    });

    console.log('✅ เพิ่มซอฟต์แวร์สำเร็จ:', software);
    showAlert('เพิ่ม Visual Studio 2022 สำเร็จ', 'success');
    return software;

  } catch (error) {
    console.error('❌ เพิ่มซอฟต์แวร์ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleInstallSoftware() {
  try {
    // ติดตั้ง Microsoft Office (ID=1) ใน PC-001
    const software = DataManager.installSoftwareOnPC(1, 'PC-001');

    console.log('✅ ติดตั้งซอฟต์แวร์สำเร็จ:', software);
    showAlert('ติดตั้งซอฟต์แวร์ใน PC-001 สำเร็จ', 'success');
    return software;

  } catch (error) {
    console.error('❌ ติดตั้งซอฟต์แวร์ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

// ========================================
// 3. การจัดการการจอง
// ========================================

function exampleAddReservation() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const reservation = DataManager.addReservation({
      studentId: '6501001',
      pcId: 'PC-010',
      date: today,
      time: '14:00',
      duration: 2,
      purpose: 'ทำโปรเจกต์ Final Year'
    });

    console.log('✅ เพิ่มการจองสำเร็จ:', reservation);
    showAlert('จอง PC-010 สำเร็จ', 'success');
    return reservation;

  } catch (error) {
    console.error('❌ เพิ่มการจองล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleCancelReservation() {
  try {
    DataManager.cancelReservation(1);

    console.log('✅ ยกเลิกการจองสำเร็จ');
    showAlert('ยกเลิกการจองสำเร็จ', 'success');

  } catch (error) {
    console.error('❌ ยกเลิกการจองล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

// ========================================
// 4. การจัดการ Session (Check-in/Check-out)
// ========================================

function exampleStartSession() {
  try {
    // ข้อมูลนักศึกษา
    const student = MOCK_DATA.students[0];

    // เริ่ม session
    const session = SessionManager.startNewSession(
      'PC-001',
      student.id,
      'internal',
      student
    );

    console.log('✅ เริ่ม Session สำเร็จ:', session);
    showAlert(`${student.name} เริ่มใช้งาน PC-001`, 'success');

    // เริ่มจับเวลา
    SessionManager.startTimer((info) => {
      console.log('⏱️ Timer:', info.elapsed.formatted, '/', info.remaining.formatted);
    });

    return session;

  } catch (error) {
    console.error('❌ เริ่ม Session ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleEndSession() {
  try {
    // จบ session พร้อม rating และ feedback
    const log = SessionManager.endCurrentSession(5, 'เครื่องดีมาก ใช้งานลื่นไหล');

    console.log('✅ จบ Session สำเร็จ:', log);
    showAlert('เลิกใช้งานสำเร็จ ขอบคุณค่ะ', 'success');

    return log;

  } catch (error) {
    console.error('❌ จบ Session ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleGetSessionInfo() {
  const info = SessionManager.getSessionInfo();

  if (info) {
    console.log('📊 Session Info:', {
      ผู้ใช้: info.userName,
      คณะ: info.faculty,
      เริ่มเวลา: formatDateThai(info.startTime),
      ใช้ไปแล้ว: info.elapsed.formatted,
      เหลือเวลา: info.remaining.formatted,
      เปอร์เซ็นต์: info.percentComplete.toFixed(1) + '%'
    });
  } else {
    console.log('ℹ️ ไม่มี Active Session');
  }

  return info;
}

// ========================================
// 5. การ Filter และ Query ข้อมูล
// ========================================

function exampleFilterLogs() {
  // Filter logs ตามเงื่อนไข
  const logs = DataManager.getFilteredLogs({
    startDate: '2024-11-25T00:00:00',
    endDate: '2024-11-28T23:59:59',
    userType: 'internal',
    faculty: 'วิทยาศาสตร์',
    minRating: 4
  });

  console.log('📊 Filtered Logs:', logs);
  console.log(`พบ ${logs.length} รายการที่ตรงเงื่อนไข`);

  return logs;
}

function exampleGetStatistics() {
  // สถิติการใช้งาน
  const stats = SessionManager.getSessionStatistics();

  console.log('📈 Session Statistics:', {
    'Session วันนี้': stats.totalSessionsToday,
    'กำลังใช้งาน': stats.activeSessionsNow,
    'ระยะเวลาเฉลี่ย': stats.averageDurationToday + ' นาที',
    'เวลารวมวันนี้': stats.totalDurationToday + ' นาที',
    'คะแนนเฉลี่ย': stats.averageRatingToday
  });

  return stats;
}

function exampleGetPCStats() {
  const stats = getPCStatistics();

  console.log('💻 PC Statistics:', {
    'ทั้งหมด': stats.total,
    'ว่าง': stats.available,
    'กำลังใช้งาน': stats.occupied,
    'ซ่อมบำรุง': stats.maintenance,
    'เปอร์เซ็นต์ว่าง': ((stats.available / stats.total) * 100).toFixed(1) + '%'
  });

  return stats;
}

// ========================================
// 6. Export/Import ข้อมูล
// ========================================

function exampleExportData() {
  try {
    const data = DataManager.exportAllData();

    console.log('✅ Export ข้อมูลสำเร็จ:', {
      จำนวน_PC: data.computers.length,
      จำนวน_Logs: data.usageLogs.length,
      จำนวน_External_Users: data.externalUsers.length,
      จำนวน_Reservations: data.reservations.length,
      วันที่_Export: data.exportDate
    });

    showAlert('ดาวน์โหลดไฟล์ Backup สำเร็จ', 'success');
    return data;

  } catch (error) {
    console.error('❌ Export ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

function exampleImportData(jsonData) {
  try {
    const result = DataManager.importAllData(jsonData);

    console.log('✅ Import ข้อมูลสำเร็จ:', result);
    showAlert('Import ข้อมูลสำเร็จ กรุณา Refresh หน้าเว็บ', 'success');

    return result;

  } catch (error) {
    console.error('❌ Import ล้มเหลว:', error.message);
    showAlert(error.message, 'danger');
  }
}

// ========================================
// 7. Data Validation & Repair
// ========================================

function exampleValidateData() {
  const validation = DataManager.validateData();

  if (validation.valid) {
    console.log('✅ ข้อมูลถูกต้องทั้งหมด');
    showAlert('ข้อมูลถูกต้องทั้งหมด', 'success');
  } else {
    console.warn('⚠️ พบปัญหาข้อมูล:', validation.issues);
    showAlert(`พบปัญหาข้อมูล ${validation.issueCount} รายการ`, 'warning');
  }

  return validation;
}

function exampleRepairData() {
  const result = DataManager.repairData();

  console.log('🔧 ซ่อมแซมข้อมูล:', {
    พบปัญหา: result.issuesFound,
    แก้ไขได้: result.fixed
  });

  if (result.fixed > 0) {
    showAlert(`ซ่อมแซมข้อมูลสำเร็จ ${result.fixed} รายการ`, 'success');
  } else {
    showAlert('ไม่มีข้อมูลที่ต้องซ่อมแซม', 'info');
  }

  return result;
}

// ========================================
// 8. การทำงานแบบ Workflow สมบูรณ์
// ========================================

/**
 * Workflow: นักศึกษา Check-in ใช้งาน และ Check-out
 */
async function exampleCompleteWorkflow() {
  console.log('\n🎯 === Complete Workflow ===\n');

  try {
    // 1. ตรวจสอบ PC ว่างหรือไม่
    console.log('1️⃣ ตรวจสอบ PC...');
    const pcId = 'PC-015';
    const pc = getComputerById(pcId);

    if (!pc || pc.status !== 'available') {
      throw new Error('PC ไม่ว่าง');
    }
    console.log('✅ PC ว่าง:', pc);

    // 2. ค้นหาข้อมูลนักศึกษา
    console.log('\n2️⃣ ค้นหาข้อมูลนักศึกษา...');
    const studentId = '6501001';
    const student = await findStudentById(studentId);
    console.log('✅ พบข้อมูล:', student);

    // 3. ตรวจสอบการจอง
    console.log('\n3️⃣ ตรวจสอบการจอง...');
    const reservation = checkReservation(studentId, pcId);
    if (reservation) {
      console.log('✅ มีการจอง:', reservation);
    } else {
      console.log('ℹ️ ไม่มีการจอง (ใช้งานทั่วไป)');
    }

    // 4. เริ่ม Session
    console.log('\n4️⃣ เริ่ม Session...');
    const session = SessionManager.startNewSession(pcId, studentId, 'internal', student);
    console.log('✅ Session เริ่มแล้ว:', session);

    // 5. จับเวลา (จำลอง)
    console.log('\n5️⃣ จับเวลาการใช้งาน...');
    let count = 0;
    SessionManager.startTimer((info) => {
      if (count < 3) { // แสดงแค่ 3 ครั้ง
        console.log(`⏱️ ${info.elapsed.formatted} / ${info.remaining.formatted}`);
        count++;
      }
    });

    // รอ 3 วินาที
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. จบ Session
    console.log('\n6️⃣ จบ Session...');
    const log = SessionManager.endCurrentSession(5, 'ทดสอบระบบ สำเร็จ!');
    console.log('✅ Log บันทึกแล้ว:', log);

    console.log('\n🎉 === Workflow สำเร็จ! ===\n');
    showAlert('Workflow ทำงานสำเร็จ!', 'success');

    return { session, log };

  } catch (error) {
    console.error('\n❌ === Workflow ล้มเหลว ===');
    console.error(error);
    showAlert('Workflow ล้มเหลว: ' + error.message, 'danger');
  }
}

// ========================================
// 9. ตัวอย่างการใช้งานในหน้า HTML
// ========================================

/**
 * ตัวอย่างการใช้ใน login-internal.html
 */
function exampleLoginInternal(studentId) {
  showLoading('กำลังตรวจสอบข้อมูล...');

  findStudentById(studentId)
    .then(student => {
      hideLoading();

      // แสดงข้อมูลนักศึกษา
      document.getElementById('studentName').textContent = student.name;
      document.getElementById('faculty').textContent = student.faculty;
      document.getElementById('year').textContent = `ปี ${student.year}`;

      // เปิดใช้งานปุ่ม Confirm
      document.getElementById('btnConfirm').disabled = false;

      showAlert('พบข้อมูลนักศึกษา', 'success');
    })
    .catch(error => {
      hideLoading();
      showAlert(error.error || 'ไม่พบข้อมูล', 'danger');
    });
}

/**
 * ตัวอย่างการใช้ใน active-session.html
 */
function exampleActiveSession() {
  const params = getURLParams();
  const session = SessionManager.getSessionInfo();

  if (!session) {
    alert('ไม่พบ Session');
    window.location.href = 'idle.html';
    return;
  }

  // แสดงข้อมูล
  document.getElementById('userName').textContent = session.userName;
  document.getElementById('pcId').textContent = session.pcId;

  // เริ่มจับเวลา
  SessionManager.startTimer((info) => {
    document.getElementById('timer').textContent = info.elapsed.formatted;

    // เปลี่ยนสีถ้าเหลือเวลาน้อย
    if (info.isNearLimit) {
      document.getElementById('timer').style.color = 'red';
    }
  });

  // ป้องกันการปิดหน้าต่าง
  SessionManager.enableUnloadProtection();
}

// ========================================
// เพิ่มฟังก์ชันลงใน Console สำหรับทดสอบ
// ========================================

if (typeof window !== 'undefined') {
  window.Examples = {
    // Computer
    addComputer: exampleAddComputer,
    updateComputer: exampleUpdateComputer,
    setMaintenance: exampleSetMaintenance,

    // Software
    addSoftware: exampleAddSoftware,
    installSoftware: exampleInstallSoftware,

    // Reservation
    addReservation: exampleAddReservation,
    cancelReservation: exampleCancelReservation,

    // Session
    startSession: exampleStartSession,
    endSession: exampleEndSession,
    getSessionInfo: exampleGetSessionInfo,

    // Query & Filter
    filterLogs: exampleFilterLogs,
    getStatistics: exampleGetStatistics,
    getPCStats: exampleGetPCStats,

    // Export/Import
    exportData: exampleExportData,
    importData: exampleImportData,

    // Validation
    validateData: exampleValidateData,
    repairData: exampleRepairData,

    // Workflow
    completeWorkflow: exampleCompleteWorkflow
  };

  console.log('📚 Examples loaded! ใช้คำสั่ง Examples.xxxx() เพื่อทดสอบ');
  console.log('ตัวอย่าง:');
  console.log('  Examples.completeWorkflow()  - ทดสอบ Workflow สมบูรณ์');
  console.log('  Examples.startSession()      - เริ่ม Session');
  console.log('  Examples.getStatistics()     - ดูสถิติ');
  console.log('  Examples.exportData()        - Export ข้อมูล');
}
