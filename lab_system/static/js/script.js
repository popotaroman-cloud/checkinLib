document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. Check-in Page: Tab Navigation
    // ==========================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabSections = document.querySelectorAll('.form-section');

    if (tabButtons.length > 0) {
        // ฟังก์ชันสลับ Tab
        window.openTab = function(tabName) {
            // ซ่อนทุก Form Section
            tabSections.forEach(section => {
                section.classList.add('hidden');
            });

            // เอา class active ออกจากทุกปุ่ม
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // แสดง Section ที่เลือก
            const targetSection = document.getElementById(tabName + '-tab');
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            // เพิ่ม active ให้ปุ่มที่ถูกกด
            // (หาปุ่มที่มี onclick ตรงกับ tabName)
            const activeBtn = Array.from(tabButtons).find(btn => 
                btn.getAttribute('onclick').includes(tabName)
            );
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        };
    }


    // ==========================================
    // 2. Checkout Page: Star Rating
    // ==========================================
    const stars = document.querySelectorAll('.rating i');
    const ratingInput = document.getElementById('ratingInput'); // ต้องมี <input type="hidden" name="rating"> ใน HTML

    if (stars.length > 0) {
        stars.forEach(star => {
            // เมื่อเอาเมาส์ผ่าน (Hover Effect)
            star.addEventListener('mouseover', function() {
                const value = this.getAttribute('data-value');
                highlightStars(value);
            });

            // เมื่อเอาเมาส์ออก (Reset ตามค่าที่เลือกไว้)
            star.addEventListener('mouseout', function() {
                const currentValue = ratingInput ? ratingInput.value : 0;
                highlightStars(currentValue);
            });

            // เมื่อคลิกเลือก (Click)
            star.addEventListener('click', function() {
                const value = this.getAttribute('data-value');
                if (ratingInput) {
                    ratingInput.value = value; // อัปเดตค่าลง Input hidden เพื่อส่งไป Backend
                }
                highlightStars(value);
            });
        });
    }

    function highlightStars(value) {
        stars.forEach(s => {
            const starValue = s.getAttribute('data-value');
            if (starValue <= value) {
                s.classList.add('checked'); // เติมสี (ใช้ class .checked ใน css)
                s.classList.remove('far');  // ลบดาวโปร่ง
                s.classList.add('fas');     // ใส่ดาวทึบ
            } else {
                s.classList.remove('checked');
                s.classList.remove('fas');
                s.classList.add('far');
            }
        });
    }


    // ==========================================
    // 3. Manager Dashboard: Auto Refresh
    // ==========================================
    // ตรวจสอบว่าอยู่ในหน้า Dashboard หรือไม่ (เช็คจาก URL หรือ Element ID)
    const dashboardGrid = document.querySelector('.pc-grid');
    
    if (dashboardGrid) {
        // รีเฟรชหน้าทุกๆ 30 วินาที เพื่ออัปเดตสถานะเครื่อง
        setInterval(() => {
            window.location.reload();
        }, 30000); 
    }

});