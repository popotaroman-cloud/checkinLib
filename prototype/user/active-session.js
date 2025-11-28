// ========================================
// Active Session Page
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

// ตรวจสอบ Session เมื่อโหลดหน้า
window.addEventListener('DOMContentLoaded', function() {
    // ตรวจสอบว่ามี Active Session หรือไม่
    if (!SessionManager.hasActiveSession()) {
        alert('ไม่พบ Session การใช้งาน');
        const params = getURLParams();
        const pcId = params.pc || 'PC-001';
        window.location.href = `idle.html?pc=${pcId}`;
        return;
    }

    // ดึงข้อมูล Session
    const session = SessionManager.getSessionInfo();

    // แสดงข้อมูลผู้ใช้
    document.getElementById('userName').textContent = session.userName;
    document.getElementById('faculty').textContent = session.faculty;
    document.getElementById('pcId').textContent = session.pcId;

    // เริ่มจับเวลา
    SessionManager.startTimer(updateTimer);

    // ป้องกันการปิดหน้าต่างโดยไม่ได้ Checkout
    SessionManager.enableUnloadProtection();

    // ปุ่ม Checkout
    document.getElementById('btnCheckout').addEventListener('click', handleCheckout);
});

// อัพเดท Timer
function updateTimer(info) {
    const timerElement = document.getElementById('timer');
    const progressBar = document.getElementById('progressBar');
    const timeRemaining = document.getElementById('timeRemaining');

    // แสดงเวลาที่ใช้ไป
    timerElement.textContent = info.elapsed.formatted;

    // แสดง Progress Bar
    if (progressBar) {
        const percent = (info.elapsedMinutes / CONFIG.MAX_SESSION_TIME) * 100;
        progressBar.style.width = Math.min(percent, 100) + '%';

        // เปลี่ยนสีถ้าใกล้หมดเวลา
        if (info.isNearLimit) {
            progressBar.style.background = '#ef4444';
        } else {
            progressBar.style.background = '#3b82f6';
        }
    }

    // แสดงเวลาที่เหลือ
    if (timeRemaining) {
        timeRemaining.textContent = `เหลือเวลาอีก ${info.remaining.formatted}`;

        if (info.isNearLimit) {
            timeRemaining.style.color = '#ef4444';
            timeRemaining.style.fontWeight = 'bold';
        }
    }

    // เปลี่ยนสี Timer ถ้าเหลือเวลาน้อย
    if (info.isNearLimit) {
        timerElement.style.color = '#ef4444';
        timerElement.classList.add('pulse');
    }
}

// Handle Checkout
function handleCheckout() {
    const session = getCurrentSession();

    if (!session) {
        alert('ไม่พบ Session');
        return;
    }

    // ยืนยันการ Checkout
    const confirmed = confirm('ต้องการเลิกใช้งานหรือไม่?');

    if (confirmed) {
        // ไปหน้า Feedback
        const duration = SessionManager.getElapsedMinutes();
        window.location.href = `feedback.html?pc=${session.pcId}&user=${session.userId}&duration=${duration}`;
    }
}
