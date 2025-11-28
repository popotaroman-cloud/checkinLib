// ========================================
// Login Internal Page
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

let currentStudent = null;
let currentPCId = null;

window.addEventListener('DOMContentLoaded', function() {
    // ดึง PC ID จาก URL
    const params = getURLParams();
    currentPCId = params.pc;

    if (!currentPCId) {
        alert('ไม่พบรหัส PC');
        window.location.href = 'idle.html';
        return;
    }

    // แสดง PC ID
    document.getElementById('pcId').textContent = currentPCId;

    // ตรวจสอบว่า PC ว่างหรือไม่
    const pc = getComputerById(currentPCId);
    if (!pc) {
        alert('ไม่พบเครื่อง PC นี้');
        window.location.href = 'idle.html';
        return;
    }

    if (pc.status !== 'available') {
        alert('เครื่องนี้ไม่ว่าง');
        window.location.href = `idle.html?pc=${currentPCId}`;
        return;
    }

    // Form Submit
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // ปุ่ม Confirm (ซ่อนไว้ตอนเริ่มต้น)
    const confirmBtn = document.getElementById('btnConfirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleConfirm);
    }

    // Auto-focus
    document.getElementById('studentId').focus();
});

// Handle Login Form
function handleLogin(e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value.trim();

    if (!studentId) {
        showAlert('กรุณากรอกรหัสนักศึกษา', 'warning');
        return;
    }

    // แสดง Loading
    showLoading('กำลังตรวจสอบข้อมูล...');

    // ค้นหานักศึกษา
    findStudentById(studentId)
        .then(student => {
            hideLoading();
            currentStudent = student;

            // แสดงข้อมูลนักศึกษา
            showStudentInfo(student);

            // ตรวจสอบการจอง
            checkReservationStatus(studentId, currentPCId);

            showAlert('พบข้อมูลนักศึกษา', 'success');
        })
        .catch(error => {
            hideLoading();
            showAlert(error.error || 'ไม่พบข้อมูล', 'danger');

            // ล้างข้อมูล
            hideStudentInfo();
        });
}

// แสดงข้อมูลนักศึกษา
function showStudentInfo(student) {
    const infoDiv = document.getElementById('studentInfo');
    const confirmBtn = document.getElementById('btnConfirm');

    if (!infoDiv) return;

    // แสดงข้อมูล
    document.getElementById('displayName').textContent = student.name;
    document.getElementById('displayFaculty').textContent = student.faculty;
    document.getElementById('displayYear').textContent = `ปี ${student.year}`;
    document.getElementById('displayProgram').textContent = student.program;

    // แสดง Section
    infoDiv.style.display = 'block';

    // เปิดปุ่ม Confirm
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }
}

// ซ่อนข้อมูลนักศึกษา
function hideStudentInfo() {
    const infoDiv = document.getElementById('studentInfo');
    const confirmBtn = document.getElementById('btnConfirm');

    if (infoDiv) {
        infoDiv.style.display = 'none';
    }

    if (confirmBtn) {
        confirmBtn.disabled = true;
    }

    currentStudent = null;
}

// ตรวจสอบการจอง
function checkReservationStatus(studentId, pcId) {
    const reservation = checkReservation(studentId, pcId);
    const reservationDiv = document.getElementById('reservationStatus');

    if (reservationDiv) {
        if (reservation) {
            reservationDiv.innerHTML = `
                <div class="alert alert-info">
                    ✅ คุณมีการจองเครื่องนี้<br>
                    <small>เวลา: ${reservation.time} (${reservation.duration} ชั่วโมง)</small><br>
                    <small>วัตถุประสงค์: ${reservation.purpose}</small>
                </div>
            `;
            reservationDiv.style.display = 'block';
        } else {
            reservationDiv.style.display = 'none';
        }
    }
}

// Handle Confirm
function handleConfirm() {
    if (!currentStudent) {
        alert('กรุณาค้นหาข้อมูลนักศึกษาก่อน');
        return;
    }

    if (!currentPCId) {
        alert('ไม่พบรหัส PC');
        return;
    }

    showLoading('กำลังเริ่มใช้งาน...');

    try {
        // เริ่ม Session
        const session = SessionManager.startNewSession(
            currentPCId,
            currentStudent.id,
            'internal',
            currentStudent
        );

        hideLoading();

        // ไปหน้า Active Session
        window.location.href = `active-session.html?pc=${currentPCId}&user=${currentStudent.id}`;

    } catch (error) {
        hideLoading();
        showAlert('ไม่สามารถเริ่มใช้งานได้: ' + error.message, 'danger');
    }
}
