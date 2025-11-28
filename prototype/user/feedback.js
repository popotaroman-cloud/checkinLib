// ========================================
// Feedback Page
// ระบบเช็คอินคอมพิวเตอร์
// ========================================

let selectedRating = 0;
let sessionDuration = 0;
let pcId = null;
let userId = null;

window.addEventListener('DOMContentLoaded', function() {
    // ดึงข้อมูลจาก URL
    const params = getURLParams();
    pcId = params.pc;
    userId = params.user;
    sessionDuration = parseInt(params.duration) || 0;

    if (!pcId || !userId) {
        alert('ข้อมูลไม่ครบถ้วน');
        window.location.href = 'idle.html';
        return;
    }

    // แสดงระยะเวลาใช้งาน
    displayDuration(sessionDuration);

    // Rating Stars
    setupRatingStars();

    // Submit Form
    document.getElementById('feedbackForm').addEventListener('submit', handleSubmit);

    // Skip Button
    const skipBtn = document.getElementById('btnSkip');
    if (skipBtn) {
        skipBtn.addEventListener('click', handleSkip);
    }
});

// แสดงระยะเวลา
function displayDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    let durationText = '';
    if (hours > 0) {
        durationText = `${hours} ชั่วโมง`;
        if (mins > 0) {
            durationText += ` ${mins} นาที`;
        }
    } else {
        durationText = `${mins} นาที`;
    }

    const durationElement = document.getElementById('duration');
    if (durationElement) {
        durationElement.textContent = durationText;
    }
}

// Setup Rating Stars
function setupRatingStars() {
    const stars = document.querySelectorAll('.star');

    stars.forEach((star, index) => {
        const rating = index + 1;

        // Click Event
        star.addEventListener('click', function() {
            selectedRating = rating;
            updateStars(rating);
        });

        // Hover Event
        star.addEventListener('mouseenter', function() {
            updateStars(rating, true);
        });
    });

    // Mouse Leave - กลับไปแสดง selected rating
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
        starsContainer.addEventListener('mouseleave', function() {
            updateStars(selectedRating);
        });
    }
}

// อัพเดทดาว
function updateStars(rating, isHover = false) {
    const stars = document.querySelectorAll('.star');

    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add(isHover ? 'hover' : 'active');
            if (!isHover) {
                star.classList.remove('hover');
            }
        } else {
            star.classList.remove('active', 'hover');
        }
    });
}

// Handle Submit
function handleSubmit(e) {
    e.preventDefault();

    const feedback = document.getElementById('feedback').value.trim();

    // ตรวจสอบว่าให้คะแนนหรือไม่
    if (selectedRating === 0) {
        const confirmed = confirm('คุณยังไม่ได้ให้คะแนน\nต้องการส่งความคิดเห็นโดยไม่ให้คะแนนหรือไม่?');
        if (!confirmed) {
            return;
        }
    }

    submitFeedback(selectedRating, feedback);
}

// Handle Skip
function handleSkip() {
    const confirmed = confirm('ต้องการข้ามการให้คะแนนหรือไม่?');

    if (confirmed) {
        submitFeedback(null, null);
    }
}

// Submit Feedback
function submitFeedback(rating, feedback) {
    showLoading('กำลังบันทึก...');

    try {
        // จบ Session
        SessionManager.endCurrentSession(rating, feedback);

        hideLoading();

        // แสดงข้อความขอบคุณ
        showThankYouMessage();

        // กลับไปหน้า Idle หลัง 2 วินาที
        setTimeout(() => {
            window.location.href = `idle.html?pc=${pcId}`;
        }, 2000);

    } catch (error) {
        hideLoading();

        // ถ้า Session ไม่พบ (อาจจะถูก Force Logout แล้ว)
        console.error('Error ending session:', error);

        // แสดงข้อความและกลับไปหน้า Idle
        showAlert('บันทึกสำเร็จ', 'success');

        setTimeout(() => {
            window.location.href = `idle.html?pc=${pcId}`;
        }, 1500);
    }
}

// แสดงข้อความขอบคุณ
function showThankYouMessage() {
    const formContainer = document.querySelector('.feedback-container');

    if (formContainer) {
        formContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                <h2 style="color: var(--success); margin-bottom: 1rem;">ขอบคุณค่ะ!</h2>
                <p style="color: var(--text-secondary);">บันทึกข้อมูลเรียบร้อยแล้ว</p>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">กำลังกลับสู่หน้าหลัก...</p>
            </div>
        `;
    }
}
