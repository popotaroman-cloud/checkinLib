// ========================================
// Data Manager - จัดการข้อมูลทั้งหมดในระบบ
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

/**
 * ระบบจัดการข้อมูล (Data Manager)
 * - จัดการการบันทึก/อ่านข้อมูลทั้งหมด
 * - Auto-sync กับ LocalStorage
 * - Validation ข้อมูลก่อนบันทึก
 * - Event listeners สำหรับการเปลี่ยนแปลงข้อมูล
 */

const DataManager = {
  // ========================================
  // Computer Management
  // ========================================

  /**
   * เพิ่มเครื่องคอมพิวเตอร์ใหม่
   */
  addComputer(computerData) {
    const computers = getComputers();

    // Validate
    if (!computerData.id || !computerData.row || !computerData.number) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    // ตรวจสอบว่า ID ซ้ำหรือไม่
    if (computers.find(pc => pc.id === computerData.id)) {
      throw new Error(`PC ID ${computerData.id} มีอยู่ในระบบแล้ว`);
    }

    const newComputer = {
      id: computerData.id,
      row: computerData.row,
      number: parseInt(computerData.number),
      status: computerData.status || 'available',
      specs: computerData.specs || 'N/A',
      software: computerData.software || [],
      currentUser: null,
      startTime: null,
      lastMaintenance: computerData.lastMaintenance || null,
      notes: computerData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    computers.push(newComputer);
    saveComputers(computers);

    this.logAction('ADD_COMPUTER', { pcId: newComputer.id });
    return newComputer;
  },

  /**
   * แก้ไขข้อมูลเครื่องคอมพิวเตอร์
   */
  updateComputer(pcId, updates) {
    const computers = getComputers();
    const pcIndex = computers.findIndex(pc => pc.id === pcId);

    if (pcIndex === -1) {
      throw new Error(`ไม่พบ PC ID ${pcId}`);
    }

    // ไม่อนุญาตให้เปลี่ยน status ถ้าเครื่องกำลังถูกใช้งาน
    if (updates.status && computers[pcIndex].status === 'occupied') {
      throw new Error('ไม่สามารถเปลี่ยนสถานะขณะมีผู้ใช้งาน');
    }

    computers[pcIndex] = {
      ...computers[pcIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveComputers(computers);
    this.logAction('UPDATE_COMPUTER', { pcId, updates });

    return computers[pcIndex];
  },

  /**
   * ลบเครื่องคอมพิวเตอร์
   */
  deleteComputer(pcId) {
    const computers = getComputers();
    const pc = computers.find(pc => pc.id === pcId);

    if (!pc) {
      throw new Error(`ไม่พบ PC ID ${pcId}`);
    }

    if (pc.status === 'occupied') {
      throw new Error('ไม่สามารถลบเครื่องที่กำลังมีผู้ใช้งาน');
    }

    const filtered = computers.filter(pc => pc.id !== pcId);
    saveComputers(filtered);

    this.logAction('DELETE_COMPUTER', { pcId });
    return true;
  },

  /**
   * ตั้งค่า Maintenance Mode
   */
  setMaintenanceMode(pcId, isOn, notes = '') {
    const pc = getComputerById(pcId);

    if (!pc) {
      throw new Error(`ไม่พบ PC ID ${pcId}`);
    }

    if (pc.status === 'occupied') {
      throw new Error('ไม่สามารถเปิด Maintenance ขณะมีผู้ใช้งาน');
    }

    const newStatus = isOn ? 'maintenance' : 'available';

    return this.updateComputer(pcId, {
      status: newStatus,
      lastMaintenance: isOn ? new Date().toISOString() : pc.lastMaintenance,
      notes: isOn ? notes : ''
    });
  },

  // ========================================
  // Software Management
  // ========================================

  /**
   * ดึงรายการซอฟต์แวร์ทั้งหมด
   */
  getSoftwareList() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEYS.SOFTWARE);
    return data ? JSON.parse(data) : MOCK_DATA.software;
  },

  /**
   * บันทึกรายการซอฟต์แวร์
   */
  saveSoftwareList(software) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SOFTWARE, JSON.stringify(software));
  },

  /**
   * เพิ่มซอฟต์แวร์ใหม่
   */
  addSoftware(softwareData) {
    const software = this.getSoftwareList();

    // Validate
    if (!softwareData.name) {
      throw new Error('กรุณาระบุชื่อซอฟต์แวร์');
    }

    // ตรวจสอบซ้ำ
    if (software.find(sw => sw.name.toLowerCase() === softwareData.name.toLowerCase())) {
      throw new Error('ซอฟต์แวร์นี้มีอยู่ในระบบแล้ว');
    }

    const newSoftware = {
      id: software.length + 1,
      name: softwareData.name,
      version: softwareData.version || 'N/A',
      category: softwareData.category || 'Other',
      license: softwareData.license || 'Free',
      installedOn: softwareData.installedOn || [],
      createdAt: new Date().toISOString()
    };

    software.push(newSoftware);
    this.saveSoftwareList(software);

    this.logAction('ADD_SOFTWARE', { softwareId: newSoftware.id, name: newSoftware.name });
    return newSoftware;
  },

  /**
   * แก้ไขซอฟต์แวร์
   */
  updateSoftware(softwareId, updates) {
    const software = this.getSoftwareList();
    const swIndex = software.findIndex(sw => sw.id === softwareId);

    if (swIndex === -1) {
      throw new Error('ไม่พบซอฟต์แวร์');
    }

    software[swIndex] = {
      ...software[swIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveSoftwareList(software);
    this.logAction('UPDATE_SOFTWARE', { softwareId, updates });

    return software[swIndex];
  },

  /**
   * ลบซอฟต์แวร์
   */
  deleteSoftware(softwareId) {
    const software = this.getSoftwareList();
    const filtered = software.filter(sw => sw.id !== softwareId);

    this.saveSoftwareList(filtered);
    this.logAction('DELETE_SOFTWARE', { softwareId });

    return true;
  },

  /**
   * ติดตั้งซอฟต์แวร์ใน PC
   */
  installSoftwareOnPC(softwareId, pcId) {
    const software = this.getSoftwareList();
    const swIndex = software.findIndex(sw => sw.id === softwareId);

    if (swIndex === -1) {
      throw new Error('ไม่พบซอฟต์แวร์');
    }

    const pc = getComputerById(pcId);
    if (!pc) {
      throw new Error('ไม่พบเครื่อง PC');
    }

    // เพิ่ม PC เข้าไปใน installedOn
    if (!software[swIndex].installedOn.includes(pcId)) {
      software[swIndex].installedOn.push(pcId);
      this.saveSoftwareList(software);

      this.logAction('INSTALL_SOFTWARE', { softwareId, pcId });
    }

    return software[swIndex];
  },

  /**
   * ถอนการติดตั้งซอฟต์แวร์จาก PC
   */
  uninstallSoftwareFromPC(softwareId, pcId) {
    const software = this.getSoftwareList();
    const swIndex = software.findIndex(sw => sw.id === softwareId);

    if (swIndex === -1) {
      throw new Error('ไม่พบซอฟต์แวร์');
    }

    software[swIndex].installedOn = software[swIndex].installedOn.filter(id => id !== pcId);
    this.saveSoftwareList(software);

    this.logAction('UNINSTALL_SOFTWARE', { softwareId, pcId });
    return software[swIndex];
  },

  // ========================================
  // Reservation Management
  // ========================================

  /**
   * เพิ่มการจอง
   */
  addReservation(reservationData) {
    const reservations = getReservations();

    // Validate
    if (!reservationData.studentId || !reservationData.pcId || !reservationData.date || !reservationData.time) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    // ตรวจสอบว่า PC มีอยู่จริง
    const pc = getComputerById(reservationData.pcId);
    if (!pc) {
      throw new Error(`ไม่พบ PC ID ${reservationData.pcId}`);
    }

    // ตรวจสอบการจองซ้ำ
    const duplicate = reservations.find(r =>
      r.pcId === reservationData.pcId &&
      r.date === reservationData.date &&
      r.time === reservationData.time
    );

    if (duplicate) {
      throw new Error('เครื่องนี้ถูกจองในช่วงเวลาดังกล่วาแล้ว');
    }

    const newReservation = {
      id: reservations.length + 1,
      studentId: reservationData.studentId,
      pcId: reservationData.pcId,
      date: reservationData.date,
      time: reservationData.time,
      duration: parseInt(reservationData.duration) || 1,
      purpose: reservationData.purpose || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));

    this.logAction('ADD_RESERVATION', { reservationId: newReservation.id, pcId: newReservation.pcId });
    return newReservation;
  },

  /**
   * ยกเลิกการจอง
   */
  cancelReservation(reservationId) {
    const reservations = getReservations();
    const reservation = reservations.find(r => r.id === reservationId);

    if (!reservation) {
      throw new Error('ไม่พบการจอง');
    }

    const updated = reservations.map(r =>
      r.id === reservationId ? { ...r, status: 'cancelled', cancelledAt: new Date().toISOString() } : r
    );

    localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
    this.logAction('CANCEL_RESERVATION', { reservationId });

    return true;
  },

  /**
   * ทำการจองให้เสร็จสมบูรณ์ (เมื่อ check-in)
   */
  completeReservation(studentId, pcId) {
    const reservations = getReservations();
    const today = new Date().toISOString().split('T')[0];

    const reservation = reservations.find(r =>
      r.studentId === studentId &&
      r.pcId === pcId &&
      r.date === today &&
      r.status === 'pending'
    );

    if (reservation) {
      const updated = reservations.map(r =>
        r.id === reservation.id ? { ...r, status: 'completed', completedAt: new Date().toISOString() } : r
      );

      localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
      this.logAction('COMPLETE_RESERVATION', { reservationId: reservation.id });
    }

    return reservation;
  },

  // ========================================
  // External User Management
  // ========================================

  /**
   * ค้นหาบุคคลภายนอกจากเลขบัตรประชาชน
   */
  findExternalUserByNationalId(nationalId) {
    const users = getExternalUsers();
    return users.find(user => user.nationalId === nationalId);
  },

  /**
   * อัพเดทข้อมูลบุคคลภายนอก
   */
  updateExternalUser(userId, updates) {
    const users = getExternalUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('ไม่พบผู้ใช้');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS, JSON.stringify(users));
    this.logAction('UPDATE_EXTERNAL_USER', { userId });

    return users[userIndex];
  },

  // ========================================
  // Usage Log Management
  // ========================================

  /**
   * อัพเดท Usage Log (เพิ่ม rating/feedback)
   */
  updateUsageLog(logId, updates) {
    const logs = getUsageLogs();
    const logIndex = logs.findIndex(log => log.id === logId);

    if (logIndex === -1) {
      throw new Error('ไม่พบ Log');
    }

    logs[logIndex] = {
      ...logs[logIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(logs));
    return logs[logIndex];
  },

  /**
   * ลบ Usage Logs ที่เก่ากว่าจำนวนวันที่กำหนด
   */
  cleanupOldLogs(daysToKeep = 30) {
    const logs = getUsageLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filtered = logs.filter(log => new Date(log.startTime) >= cutoffDate);
    const deletedCount = logs.length - filtered.length;

    localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(filtered));
    this.logAction('CLEANUP_LOGS', { daysToKeep, deletedCount });

    return {
      before: logs.length,
      after: filtered.length,
      deleted: deletedCount
    };
  },

  /**
   * ดึง Logs ตามเงื่อนไข
   */
  getFilteredLogs(filters = {}) {
    let logs = getUsageLogs();

    // Filter by date range
    if (filters.startDate) {
      logs = logs.filter(log => log.startTime >= filters.startDate);
    }
    if (filters.endDate) {
      logs = logs.filter(log => log.startTime <= filters.endDate);
    }

    // Filter by user type
    if (filters.userType && filters.userType !== 'all') {
      logs = logs.filter(log => log.userType === filters.userType);
    }

    // Filter by faculty
    if (filters.faculty && filters.faculty !== 'all') {
      logs = logs.filter(log => log.faculty === filters.faculty);
    }

    // Filter by PC
    if (filters.pcId) {
      logs = logs.filter(log => log.pcId === filters.pcId);
    }

    // Filter by rating
    if (filters.minRating) {
      logs = logs.filter(log => log.rating && log.rating >= filters.minRating);
    }

    return logs;
  },

  // ========================================
  // Action Logging (สำหรับ Audit Trail)
  // ========================================

  /**
   * บันทึก Action ของ Admin
   */
  logAction(action, details = {}) {
    const actionLogs = this.getActionLogs();

    const newLog = {
      id: actionLogs.length + 1,
      action,
      details,
      timestamp: new Date().toISOString(),
      user: 'admin' // ในอนาคตอาจเพิ่ม admin user system
    };

    actionLogs.push(newLog);

    // เก็บแค่ 500 logs ล่าสุด
    const limitedLogs = actionLogs.slice(-500);
    localStorage.setItem('actionLogs', JSON.stringify(limitedLogs));

    return newLog;
  },

  /**
   * ดึง Action Logs
   */
  getActionLogs() {
    const data = localStorage.getItem('actionLogs');
    return data ? JSON.parse(data) : [];
  },

  // ========================================
  // Data Export/Import
  // ========================================

  /**
   * Export ข้อมูลทั้งหมด
   */
  exportAllData() {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      computers: getComputers(),
      usageLogs: getUsageLogs(),
      externalUsers: getExternalUsers(),
      reservations: getReservations(),
      software: this.getSoftwareList(),
      actionLogs: this.getActionLogs()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkin_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.logAction('EXPORT_DATA', { recordCount: Object.values(data).flat().length });
    return data;
  },

  /**
   * Import ข้อมูลทั้งหมด
   */
  importAllData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Validate
      if (!data.computers || !data.usageLogs) {
        throw new Error('ข้อมูลไม่ถูกต้อง');
      }

      // Backup current data first
      const backup = this.exportAllData();

      // Import
      saveComputers(data.computers);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(data.usageLogs));
      localStorage.setItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS, JSON.stringify(data.externalUsers || []));
      localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(data.reservations || []));
      if (data.software) {
        this.saveSoftwareList(data.software);
      }

      this.logAction('IMPORT_DATA', { source: data.version || 'unknown' });

      return {
        success: true,
        imported: {
          computers: data.computers.length,
          usageLogs: data.usageLogs.length,
          externalUsers: (data.externalUsers || []).length,
          reservations: (data.reservations || []).length,
          software: (data.software || []).length
        }
      };
    } catch (error) {
      throw new Error('Import ล้มเหลว: ' + error.message);
    }
  },

  /**
   * Reset ข้อมูลทั้งหมดกลับเป็น Mock Data
   */
  resetToMockData() {
    if (!confirm('ต้องการ Reset ข้อมูลทั้งหมดกลับเป็น Mock Data หรือไม่?\n\nข้อมูลปัจจุบันจะถูกลบทั้งหมด!')) {
      return false;
    }

    // Backup ก่อน reset
    this.exportAllData();

    // Clear all
    Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    this.logAction('RESET_TO_MOCK_DATA');

    alert('Reset เสร็จสิ้น! กรุณา Refresh หน้าเว็บ');
    return true;
  },

  // ========================================
  // Data Validation & Repair
  // ========================================

  /**
   * ตรวจสอบความสมบูรณ์ของข้อมูล
   */
  validateData() {
    const issues = [];
    const computers = getComputers();
    const logs = getUsageLogs();

    // ตรวจสอบ PC ที่ status = occupied แต่ไม่มี currentUser
    computers.forEach(pc => {
      if (pc.status === 'occupied' && !pc.currentUser) {
        issues.push({
          type: 'ORPHANED_OCCUPIED_PC',
          pcId: pc.id,
          fix: () => this.updateComputer(pc.id, { status: 'available' })
        });
      }

      if (pc.status === 'occupied' && !pc.startTime) {
        issues.push({
          type: 'MISSING_START_TIME',
          pcId: pc.id,
          fix: () => this.updateComputer(pc.id, { status: 'available', currentUser: null })
        });
      }
    });

    // ตรวจสอบ logs ที่มี duration = 0 หรือติดลบ
    logs.forEach(log => {
      if (log.duration <= 0) {
        issues.push({
          type: 'INVALID_DURATION',
          logId: log.id,
          duration: log.duration
        });
      }
    });

    return {
      valid: issues.length === 0,
      issues,
      issueCount: issues.length
    };
  },

  /**
   * ซ่อมแซมข้อมูลอัตโนมัติ
   */
  repairData() {
    const validation = this.validateData();
    let fixedCount = 0;

    validation.issues.forEach(issue => {
      if (issue.fix) {
        try {
          issue.fix();
          fixedCount++;
        } catch (error) {
          console.error('Cannot fix issue:', issue, error);
        }
      }
    });

    this.logAction('REPAIR_DATA', { issuesFound: validation.issueCount, fixed: fixedCount });

    return {
      issuesFound: validation.issueCount,
      fixed: fixedCount
    };
  }
};

// Export สำหรับใช้ในหน้าอื่น
if (typeof window !== 'undefined') {
  window.DataManager = DataManager;
}
