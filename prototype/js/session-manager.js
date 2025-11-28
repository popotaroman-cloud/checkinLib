// ========================================
// Session Manager - จัดการ Session การใช้งาน
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

/**
 * ระบบจัดการ Session
 * - จัดการ Check-in/Check-out
 * - ติดตามเวลาการใช้งานแบบ Real-time
 * - เตือนก่อนหมดเวลา
 * - Auto-save session
 */

const SessionManager = {
  // Timer interval ID
  timerInterval: null,

  // Session timeout warning
  warningShown: false,

  /**
   * เริ่ม Session ใหม่
   */
  startNewSession(pcId, userId, userType, userData) {
    try {
      // ตรวจสอบว่า PC ว่างหรือไม่
      const pc = getComputerById(pcId);
      if (!pc) {
        throw new Error('ไม่พบเครื่อง PC');
      }

      if (pc.status === 'occupied') {
        throw new Error('เครื่องนี้กำลังมีผู้ใช้งานอยู่');
      }

      if (pc.status === 'maintenance') {
        throw new Error('เครื่องนี้อยู่ระหว่างการซ่อมบำรุง');
      }

      // สร้าง session object
      const session = {
        sessionId: this.generateSessionId(),
        pcId,
        userId,
        userType,
        userName: userData.name || `${userData.firstName} ${userData.lastName}`,
        faculty: userData.faculty || userData.organization || 'บุคคลภายนอก',
        year: userData.year || null,
        program: userData.program || null,
        startTime: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        active: true
      };

      // บันทึก session
      saveCurrentSession(session);

      // อัพเดทสถานะ PC
      updateComputerStatus(pcId, 'occupied', {
        currentUser: userId,
        currentUserName: session.userName,
        startTime: session.startTime,
        sessionId: session.sessionId
      });

      // ตรวจสอบและทำการจองให้สำเร็จ (ถ้ามี)
      if (userType === 'internal') {
        DataManager.completeReservation(userId, pcId);
      }

      // Log action
      DataManager.logAction('START_SESSION', {
        sessionId: session.sessionId,
        pcId,
        userId,
        userType
      });

      console.log('[SessionManager] Session started:', session);
      return session;

    } catch (error) {
      console.error('[SessionManager] Failed to start session:', error);
      throw error;
    }
  },

  /**
   * สิ้นสุด Session
   */
  endCurrentSession(rating = null, feedback = null) {
    try {
      const session = getCurrentSession();

      if (!session) {
        throw new Error('ไม่พบ Session ที่กำลังใช้งาน');
      }

      if (!session.active) {
        throw new Error('Session นี้ถูกปิดไปแล้ว');
      }

      const endTime = new Date().toISOString();
      const duration = calculateDuration(session.startTime, endTime);

      // สร้าง usage log
      const log = {
        sessionId: session.sessionId,
        userId: session.userId,
        userType: session.userType,
        userName: session.userName,
        faculty: session.faculty,
        year: session.year,
        program: session.program,
        pcId: session.pcId,
        startTime: session.startTime,
        endTime,
        duration,
        rating: rating ? parseInt(rating) : null,
        feedback: feedback || null
      };

      // บันทึก log
      const savedLog = addUsageLog(log);

      // อัพเดทสถานะ PC
      updateComputerStatus(session.pcId, 'available', {
        currentUser: null,
        currentUserName: null,
        startTime: null,
        sessionId: null,
        lastUsed: endTime
      });

      // ลบ session
      clearCurrentSession();

      // Stop timer
      this.stopTimer();

      // Log action
      DataManager.logAction('END_SESSION', {
        sessionId: session.sessionId,
        pcId: session.pcId,
        duration,
        rating
      });

      console.log('[SessionManager] Session ended:', savedLog);
      return savedLog;

    } catch (error) {
      console.error('[SessionManager] Failed to end session:', error);
      throw error;
    }
  },

  /**
   * เริ่มจับเวลา Real-time
   */
  startTimer(callback) {
    const session = getCurrentSession();

    if (!session) {
      console.error('[SessionManager] No active session');
      return;
    }

    // อัพเดททุก 1 วินาที
    this.timerInterval = setInterval(() => {
      const elapsed = this.getElapsedTime();
      const remaining = this.getRemainingTime();

      // เรียก callback พร้อมข้อมูล
      if (callback) {
        callback({
          elapsed,
          remaining,
          elapsedSeconds: this.getElapsedSeconds(),
          remainingSeconds: this.getRemainingSeconds(),
          isNearLimit: remaining <= CONFIG.WARNING_TIME,
          isOverLimit: remaining <= 0
        });
      }

      // แสดง warning ถ้าเหลือเวลาน้อย
      if (remaining <= CONFIG.WARNING_TIME && remaining > 0 && !this.warningShown) {
        this.showTimeWarning(remaining);
        this.warningShown = true;
      }

      // Auto logout ถ้าหมดเวลา
      if (remaining <= 0) {
        this.autoLogout();
      }

      // Auto-save session ทุก 30 วินาที
      if (this.getElapsedSeconds() % 30 === 0) {
        this.updateSessionActivity();
      }

    }, 1000);

    console.log('[SessionManager] Timer started');
  },

  /**
   * หยุดจับเวลา
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.warningShown = false;
      console.log('[SessionManager] Timer stopped');
    }
  },

  /**
   * ดึงเวลาที่ผ่านไป (วินาที)
   */
  getElapsedSeconds() {
    const session = getCurrentSession();
    if (!session) return 0;

    const start = new Date(session.startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000);
  },

  /**
   * ดึงเวลาที่ผ่านไป (นาที)
   */
  getElapsedMinutes() {
    return Math.floor(this.getElapsedSeconds() / 60);
  },

  /**
   * ดึงเวลาที่ผ่านไป (รูปแบบ HH:MM:SS)
   */
  getElapsedTime() {
    const totalSeconds = this.getElapsedSeconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    };
  },

  /**
   * ดึงเวลาที่เหลือ (นาที)
   */
  getRemainingMinutes() {
    const elapsed = this.getElapsedMinutes();
    const remaining = CONFIG.MAX_SESSION_TIME - elapsed;
    return Math.max(0, remaining);
  },

  /**
   * ดึงเวลาที่เหลือ (วินาที)
   */
  getRemainingSeconds() {
    const elapsed = this.getElapsedSeconds();
    const remaining = (CONFIG.MAX_SESSION_TIME * 60) - elapsed;
    return Math.max(0, remaining);
  },

  /**
   * ดึงเวลาที่เหลือ (รูปแบบ HH:MM:SS)
   */
  getRemainingTime() {
    const totalSeconds = this.getRemainingSeconds();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    };
  },

  /**
   * แสดงคำเตือนเวลา
   */
  showTimeWarning(remaining) {
    const message = `เหลือเวลาการใช้งานอีก ${remaining.minutes} นาที ${remaining.seconds} วินาที`;

    // แสดง alert หรือ notification
    if (typeof showAlert === 'function') {
      showAlert(message, 'warning');
    } else {
      alert(message);
    }

    // เล่นเสียง (ถ้ามี)
    this.playWarningSound();

    console.log('[SessionManager] Time warning shown:', message);
  },

  /**
   * Auto logout เมื่อหมดเวลา
   */
  autoLogout() {
    console.log('[SessionManager] Auto logout triggered');

    this.stopTimer();

    // บันทึก session ด้วย rating = null
    try {
      this.endCurrentSession(null, 'Auto logout - Time limit exceeded');

      alert('หมดเวลาการใช้งาน\nระบบทำการ Logout อัตโนมัติ');

      // กลับไปหน้า idle
      const session = getCurrentSession();
      if (session) {
        window.location.href = `idle.html?pc=${session.pcId}`;
      }

    } catch (error) {
      console.error('[SessionManager] Auto logout failed:', error);
    }
  },

  /**
   * อัพเดท Session Activity (Auto-save)
   */
  updateSessionActivity() {
    const session = getCurrentSession();
    if (session) {
      session.lastUpdate = new Date().toISOString();
      saveCurrentSession(session);
    }
  },

  /**
   * ตรวจสอบว่ามี Active Session หรือไม่
   */
  hasActiveSession() {
    const session = getCurrentSession();
    return session && session.active;
  },

  /**
   * ดึงข้อมูล Session ปัจจุบัน
   */
  getSessionInfo() {
    const session = getCurrentSession();
    if (!session) return null;

    return {
      ...session,
      elapsed: this.getElapsedTime(),
      remaining: this.getRemainingTime(),
      elapsedMinutes: this.getElapsedMinutes(),
      remainingMinutes: this.getRemainingMinutes(),
      percentComplete: (this.getElapsedMinutes() / CONFIG.MAX_SESSION_TIME) * 100
    };
  },

  /**
   * สร้าง Session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `sess_${timestamp}_${random}`;
  },

  /**
   * เล่นเสียงเตือน
   */
  playWarningSound() {
    try {
      // สร้างเสียง beep ด้วย Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

    } catch (error) {
      console.warn('[SessionManager] Cannot play warning sound:', error);
    }
  },

  /**
   * ป้องกันการปิดหน้าต่างโดยไม่ได้ Checkout
   */
  enableUnloadProtection() {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasActiveSession()) {
        e.preventDefault();
        e.returnValue = 'คุณยังไม่ได้เลิกใช้งาน ต้องการออกจากหน้านี้จริงหรือไม่?';
        return e.returnValue;
      }
    });

    console.log('[SessionManager] Unload protection enabled');
  },

  /**
   * ต่ออายุเวลา Session (ถ้ามีฟีเจอร์นี้)
   */
  extendSession(additionalMinutes = 30) {
    const session = getCurrentSession();
    if (!session) {
      throw new Error('ไม่พบ Session ที่กำลังใช้งาน');
    }

    // ปรับ start time ให้ดูเหมือนได้เวลาเพิ่ม
    const currentElapsed = this.getElapsedMinutes();
    const newElapsedAfterExtension = Math.max(0, currentElapsed - additionalMinutes);
    const newStartTime = new Date(Date.now() - (newElapsedAfterExtension * 60000));

    session.startTime = newStartTime.toISOString();
    session.extended = (session.extended || 0) + additionalMinutes;

    saveCurrentSession(session);

    DataManager.logAction('EXTEND_SESSION', {
      sessionId: session.sessionId,
      additionalMinutes
    });

    console.log('[SessionManager] Session extended by', additionalMinutes, 'minutes');
    return session;
  },

  /**
   * รับข้อมูล Statistics ของ Session
   */
  getSessionStatistics() {
    const logs = getUsageLogs();
    const today = new Date().toISOString().split('T')[0];

    // Sessions today
    const todaySessions = logs.filter(log => log.startTime.startsWith(today));

    // Active sessions
    const computers = getComputers();
    const activeSessions = computers.filter(pc => pc.status === 'occupied');

    return {
      totalSessionsToday: todaySessions.length,
      activeSessionsNow: activeSessions.length,
      averageDurationToday: todaySessions.length > 0
        ? Math.round(todaySessions.reduce((sum, log) => sum + log.duration, 0) / todaySessions.length)
        : 0,
      totalDurationToday: todaySessions.reduce((sum, log) => sum + log.duration, 0),
      averageRatingToday: todaySessions.filter(log => log.rating).length > 0
        ? (todaySessions.reduce((sum, log) => sum + (log.rating || 0), 0) / todaySessions.filter(log => log.rating).length).toFixed(1)
        : 0
    };
  }
};

// Export สำหรับใช้ในหน้าอื่น
if (typeof window !== 'undefined') {
  window.SessionManager = SessionManager;
}
