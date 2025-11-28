// ========================================
// Mock Data Configuration
// ระบบเช็คอินคอมพิวเตอร์ - Extended Version
// ========================================

const MOCK_DATA = {
  // รายชื่อนักศึกษาและบุคลากร (ขยายเป็น 30 คน)
  students: [
    // วิทยาศาสตร์
    { id: '6501001', firstName: 'สมชาย', lastName: 'ใจดี', faculty: 'วิทยาศาสตร์', year: 3, program: 'วิทยาการคอมพิวเตอร์', email: 'somchai@university.ac.th', phone: '0812345001' },
    { id: '6501004', firstName: 'มาลี', lastName: 'สวยงาม', faculty: 'วิทยาศาสตร์', year: 1, program: 'เทคโนโลยีสารสนเทศ', email: 'malee@university.ac.th', phone: '0812345004' },
    { id: '6501008', firstName: 'ธนพล', lastName: 'พัฒนา', faculty: 'วิทยาศาสตร์', year: 2, program: 'วิทยาการข้อมูล', email: 'thanaphon@university.ac.th', phone: '0812345008' },
    { id: '6501012', firstName: 'สุดารัตน์', lastName: 'เจริญ', faculty: 'วิทยาศาสตร์', year: 4, program: 'วิทยาการคอมพิวเตอร์', email: 'sudarat@university.ac.th', phone: '0812345012' },
    { id: '6501016', firstName: 'ชัยวัฒน์', lastName: 'ก้าวหน้า', faculty: 'วิทยาศาสตร์', year: 3, program: 'เทคโนโลยีสารสนเทศ', email: 'chaiwat@university.ac.th', phone: '0812345016' },
    { id: '6501020', firstName: 'พิมพ์ชนก', lastName: 'สุขใจ', faculty: 'วิทยาศาสตร์', year: 1, program: 'วิทยาการข้อมูล', email: 'pimchanok@university.ac.th', phone: '0812345020' },

    // วิศวกรรมศาสตร์
    { id: '6501002', firstName: 'สมหญิง', lastName: 'รักเรียน', faculty: 'วิศวกรรมศาสตร์', year: 2, program: 'วิศวกรรมคอมพิวเตอร์', email: 'somying@university.ac.th', phone: '0812345002' },
    { id: '6501005', firstName: 'ประเสริฐ', lastName: 'เรียนดี', faculty: 'วิศวกรรมศาสตร์', year: 3, program: 'วิศวกรรมซอฟต์แวร์', email: 'prasert@university.ac.th', phone: '0812345005' },
    { id: '6501009', firstName: 'นันทิยา', lastName: 'มั่นคง', faculty: 'วิศวกรรมศาสตร์', year: 4, program: 'วิศวกรรมคอมพิวเตอร์', email: 'nantiya@university.ac.th', phone: '0812345009' },
    { id: '6501013', firstName: 'วีระพงษ์', lastName: 'ทรงธรรม', faculty: 'วิศวกรรมศาสตร์', year: 2, program: 'วิศวกรรมซอฟต์แวร์', email: 'veerapong@university.ac.th', phone: '0812345013' },
    { id: '6501017', firstName: 'กนกวรรณ', lastName: 'สมบูรณ์', faculty: 'วิศวกรรมศาสตร์', year: 1, program: 'วิศวกรรมคอมพิวเตอร์', email: 'kanokwan@university.ac.th', phone: '0812345017' },
    { id: '6501021', firstName: 'ศักดิ์ชัย', lastName: 'บุญเรือง', faculty: 'วิศวกรรมศาสตร์', year: 3, program: 'วิศวกรรมระบบสารสนเทศ', email: 'sakchai@university.ac.th', phone: '0812345021' },

    // ครุศาสตร์
    { id: '6501003', firstName: 'วิชัย', lastName: 'มานะดี', faculty: 'ครุศาสตร์', year: 4, program: 'เทคโนโลยีการศึกษา', email: 'wichai@university.ac.th', phone: '0812345003' },
    { id: '6501010', firstName: 'อรุณี', lastName: 'สุขสันต์', faculty: 'ครุศาสตร์', year: 2, program: 'คอมพิวเตอร์ศึกษา', email: 'arunee@university.ac.th', phone: '0812345010' },
    { id: '6501014', firstName: 'สมพร', lastName: 'วิไลลักษณ์', faculty: 'ครุศาสตร์', year: 3, program: 'เทคโนโลยีการศึกษา', email: 'somporn@university.ac.th', phone: '0812345014' },
    { id: '6501022', firstName: 'ปิยะพงษ์', lastName: 'นวลจันทร์', faculty: 'ครุศาสตร์', year: 1, program: 'คอมพิวเตอร์ศึกษา', email: 'piyapong@university.ac.th', phone: '0812345022' },

    // มนุษยศาสตร์และสังคมศาสตร์
    { id: '6501006', firstName: 'ณัฐวุฒิ', lastName: 'พัฒนพงศ์', faculty: 'มนุษยศาสตร์และสังคมศาสตร์', year: 2, program: 'นิเทศศาสตร์ดิจิทัล', email: 'nattawut@university.ac.th', phone: '0812345006' },
    { id: '6501011', firstName: 'ชนิดา', lastName: 'สุขประเสริฐ', faculty: 'มนุษยศาสตร์และสังคมศาสตร์', year: 3, program: 'สื่อดิจิทัล', email: 'chanida@university.ac.th', phone: '0812345011' },
    { id: '6501018', firstName: 'รัชนก', lastName: 'ศรีสุข', faculty: 'มนุษยศาสตร์และสังคมศาสตร์', year: 4, program: 'นิเทศศาสตร์ดิจิทัล', email: 'rachanok@university.ac.th', phone: '0812345018' },
    { id: '6501023', firstName: 'ธนากร', lastName: 'จันทร์เจริญ', faculty: 'มนุษยศาสตร์และสังคมศาสตร์', year: 1, program: 'สื่อดิจิทัล', email: 'thanakorn@university.ac.th', phone: '0812345023' },

    // บริหารธุรกิจ
    { id: '6501007', firstName: 'ภัทรพล', lastName: 'ธนสมบัติ', faculty: 'บริหารธุรกิจ', year: 3, program: 'ระบบสารสนเทศทางธุรกิจ', email: 'phattharaphon@university.ac.th', phone: '0812345007' },
    { id: '6501015', firstName: 'ศิริพร', lastName: 'รุ่งเรือง', faculty: 'บริหารธุรกิจ', year: 2, program: 'การจัดการเทคโนโลยี', email: 'siriporn@university.ac.th', phone: '0812345015' },
    { id: '6501019', firstName: 'อนุชา', lastName: 'มีทรัพย์', faculty: 'บริหารธุรกิจ', year: 4, program: 'ระบบสารสนเทศทางธุรกิจ', email: 'anucha@university.ac.th', phone: '0812345019' },
    { id: '6501024', firstName: 'ปรียานุช', lastName: 'สว่างวงศ์', faculty: 'บริหารธุรกิจ', year: 1, program: 'การจัดการเทคโนโลยี', email: 'priya@university.ac.th', phone: '0812345024' },

    // บุคลากร
    { id: 'T001', firstName: 'ดร.สุรพล', lastName: 'วิชาการ', faculty: 'วิทยาศาสตร์', year: null, program: 'อาจารย์', email: 'suraphon@university.ac.th', phone: '0899001001' },
    { id: 'T002', firstName: 'ผศ.ดร.ปรียา', lastName: 'สอนดี', faculty: 'วิศวกรรมศาสตร์', year: null, program: 'อาจารย์', email: 'priya.s@university.ac.th', phone: '0899001002' },
    { id: 'S001', firstName: 'วิไล', lastName: 'ช่วยเหลือ', faculty: 'สำนักงานธุรการ', year: null, program: 'เจ้าหน้าที่', email: 'wilai@university.ac.th', phone: '0899001003' },
    { id: 'S002', firstName: 'สมบูรณ์', lastName: 'รักษาทรัพย์', faculty: 'งานบริหารทั่วไป', year: null, program: 'เจ้าหน้าที่', email: 'somboon@university.ac.th', phone: '0899001004' },
    { id: '6501025', firstName: 'ธัญญา', lastName: 'เจริญสุข', faculty: 'วิทยาศาสตร์', year: 2, program: 'วิทยาการคอมพิวเตอร์', email: 'thanya@university.ac.th', phone: '0812345025' },
    { id: '6501026', firstName: 'กิตติพงษ์', lastName: 'แสงจันทร์', faculty: 'วิศวกรรมศาสตร์', year: 3, program: 'วิศวกรรมคอมพิวเตอร์', email: 'kittipong@university.ac.th', phone: '0812345026' }
  ],

  // รายชื่อบุคคลภายนอก (ขยายเป็น 15 คน)
  externalUsers: [
    { id: 'ext-001', nationalId: '1234567890123', firstName: 'นิรันดร์', lastName: 'ศรีสุข', organization: 'บริษัท ABC จำกัด', createdAt: '2024-11-20T10:30:00' },
    { id: 'ext-002', nationalId: '1234567890124', firstName: 'สุชาดา', lastName: 'มั่นคง', organization: 'บริษัท XYZ จำกัด', createdAt: '2024-11-21T09:15:00' },
    { id: 'ext-003', nationalId: '1234567890125', firstName: 'ประยุทธ', lastName: 'เจริญชัย', organization: 'ห้างหุ้นส่วน DEF', createdAt: '2024-11-21T14:20:00' },
    { id: 'ext-004', nationalId: '1234567890126', firstName: 'วรรณา', lastName: 'สมบูรณ์', organization: 'องค์การ GHI', createdAt: '2024-11-22T11:00:00' },
    { id: 'ext-005', nationalId: '1234567890127', firstName: 'สมศักดิ์', lastName: 'ทรงธรรม', organization: 'มูลนิธิ JKL', createdAt: '2024-11-23T08:45:00' },
    { id: 'ext-006', nationalId: '1234567890128', firstName: 'อรพิน', lastName: 'นวลจันทร์', organization: 'บริษัท MNO จำกัด', createdAt: '2024-11-24T13:30:00' },
    { id: 'ext-007', nationalId: '1234567890129', firstName: 'วิชิต', lastName: 'ดีเลิศ', organization: 'สถาบัน PQR', createdAt: '2024-11-24T15:00:00' },
    { id: 'ext-008', nationalId: '1234567890130', firstName: 'ณัฐกานต์', lastName: 'สว่างแสง', organization: 'ห้างหุ้นส่วน STU', createdAt: '2024-11-25T10:20:00' },
    { id: 'ext-009', nationalId: '1234567890131', firstName: 'ธนวัฒน์', lastName: 'พัฒนาชัย', organization: 'บริษัท VWX จำกัด', createdAt: '2024-11-25T16:45:00' },
    { id: 'ext-010', nationalId: '1234567890132', firstName: 'สิริลักษณ์', lastName: 'บุญมี', organization: 'องค์การ YZ1', createdAt: '2024-11-26T09:00:00' },
    { id: 'ext-011', nationalId: '1234567890133', firstName: 'พิพัฒน์', lastName: 'เจริญวงศ์', organization: 'ศูนย์ ABC Research', createdAt: '2024-11-26T11:30:00' },
    { id: 'ext-012', nationalId: '1234567890134', firstName: 'กัญญา', lastName: 'ศรีประเสริฐ', organization: 'สำนักงาน DEF', createdAt: '2024-11-27T08:00:00' },
    { id: 'ext-013', nationalId: '1234567890135', firstName: 'ณรงค์', lastName: 'วิทยานุกูล', organization: 'บริษัท GHI Tech', createdAt: '2024-11-27T14:15:00' },
    { id: 'ext-014', nationalId: '1234567890136', firstName: 'พรทิพย์', lastName: 'สุขสันต์', organization: 'มหาวิทยาลัยเอกชน', createdAt: '2024-11-27T10:45:00' },
    { id: 'ext-015', nationalId: '1234567890137', firstName: 'อดิศักดิ์', lastName: 'รุ่งโรจน์', organization: 'สถานประกอบการ JKL', createdAt: '2024-11-28T09:30:00' }
  ],

  // รายการเครื่องคอมพิวเตอร์ (ขยายเป็น 30 เครื่อง)
  computers: [
    // Row A (5 เครื่อง)
    { id: 'PC-001', status: 'available', location: 'A1', row: 'A', col: 1, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-01' },
    { id: 'PC-002', status: 'occupied', location: 'A2', row: 'A', col: 2, currentUser: '6501001', startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), software: ['MS Office', 'VS Code', 'Chrome', 'Python'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-01' },
    { id: 'PC-003', status: 'maintenance', location: 'A3', row: 'A', col: 3, software: ['MS Office'], specs: 'i5-10400, 8GB RAM, 256GB SSD', lastMaintenance: '2024-11-15', maintenanceNote: 'กำลังซ่อมแซมเมาส์' },
    { id: 'PC-004', status: 'available', location: 'A4', row: 'A', col: 4, software: ['MS Office', 'VS Code', 'Chrome', 'Python'], specs: 'i7-11700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-01' },
    { id: 'PC-005', status: 'occupied', location: 'A5', row: 'A', col: 5, currentUser: '6501002', startTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(), software: ['MS Office', 'Chrome', 'Photoshop', 'Illustrator'], specs: 'i7-11700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-01' },

    // Row B (5 เครื่อง)
    { id: 'PC-006', status: 'available', location: 'B1', row: 'B', col: 1, software: ['MS Office', 'VS Code'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-05' },
    { id: 'PC-007', status: 'available', location: 'B2', row: 'B', col: 2, software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-05' },
    { id: 'PC-008', status: 'available', location: 'B3', row: 'B', col: 3, software: ['MS Office', 'VS Code', 'Chrome', 'PyCharm'], specs: 'i7-11700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-05' },
    { id: 'PC-009', status: 'occupied', location: 'B4', row: 'B', col: 4, currentUser: 'ext-001', startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-05' },
    { id: 'PC-010', status: 'available', location: 'B5', row: 'B', col: 5, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-05' },

    // Row C (5 เครื่อง)
    { id: 'PC-011', status: 'available', location: 'C1', row: 'C', col: 1, software: ['MS Office', 'Chrome'], specs: 'i5-10400, 8GB RAM, 256GB SSD', lastMaintenance: '2024-10-28' },
    { id: 'PC-012', status: 'available', location: 'C2', row: 'C', col: 2, software: ['MS Office', 'Chrome'], specs: 'i5-10400, 8GB RAM, 256GB SSD', lastMaintenance: '2024-10-28' },
    { id: 'PC-013', status: 'occupied', location: 'C3', row: 'C', col: 3, currentUser: '6501005', startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), software: ['MS Office', 'VS Code', 'Chrome', 'IntelliJ'], specs: 'i7-11700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-08' },
    { id: 'PC-014', status: 'available', location: 'C4', row: 'C', col: 4, software: ['MS Office', 'Chrome', 'Edge'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-08' },
    { id: 'PC-015', status: 'available', location: 'C5', row: 'C', col: 5, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-08' },

    // Row D (5 เครื่อง)
    { id: 'PC-016', status: 'available', location: 'D1', row: 'D', col: 1, software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-10' },
    { id: 'PC-017', status: 'maintenance', location: 'D2', row: 'D', col: 2, software: ['MS Office'], specs: 'i5-10400, 8GB RAM, 256GB SSD', lastMaintenance: '2024-11-20', maintenanceNote: 'อัพเกรด RAM' },
    { id: 'PC-018', status: 'available', location: 'D3', row: 'D', col: 3, software: ['MS Office', 'VS Code', 'Chrome', 'Android Studio'], specs: 'i7-12700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-10' },
    { id: 'PC-019', status: 'occupied', location: 'D4', row: 'D', col: 4, currentUser: '6501008', startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-10' },
    { id: 'PC-020', status: 'available', location: 'D5', row: 'D', col: 5, software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-10' },

    // Row E (5 เครื่อง)
    { id: 'PC-021', status: 'available', location: 'E1', row: 'E', col: 1, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-12' },
    { id: 'PC-022', status: 'available', location: 'E2', row: 'E', col: 2, software: ['MS Office', 'Chrome', 'Photoshop'], specs: 'i7-11700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-12' },
    { id: 'PC-023', status: 'available', location: 'E3', row: 'E', col: 3, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-12' },
    { id: 'PC-024', status: 'occupied', location: 'E4', row: 'E', col: 4, currentUser: '6501012', startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), software: ['MS Office', 'VS Code', 'Chrome', 'Python'], specs: 'i7-11700, 32GB RAM, 1TB SSD', lastMaintenance: '2024-11-12' },
    { id: 'PC-025', status: 'available', location: 'E5', row: 'E', col: 5, software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-12' },

    // Row F (5 เครื่อง)
    { id: 'PC-026', status: 'available', location: 'F1', row: 'F', col: 1, software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-15' },
    { id: 'PC-027', status: 'available', location: 'F2', row: 'F', col: 2, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-15' },
    { id: 'PC-028', status: 'available', location: 'F3', row: 'F', col: 3, software: ['MS Office', 'Chrome', 'Edge'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-15' },
    { id: 'PC-029', status: 'available', location: 'F4', row: 'F', col: 4, software: ['MS Office', 'VS Code', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-15' },
    { id: 'PC-030', status: 'occupied', location: 'F5', row: 'F', col: 5, currentUser: 'ext-005', startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(), software: ['MS Office', 'Chrome'], specs: 'i5-11400, 16GB RAM, 512GB SSD', lastMaintenance: '2024-11-15' }
  ],

  // ข้อมูลการจอง (ขยายเป็น 20 รายการ)
  reservations: [
    { id: 1, studentId: '6501001', pcId: 'PC-001', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 2, purpose: 'ทำโปรเจกต์' },
    { id: 2, studentId: '6501003', pcId: 'PC-006', date: new Date().toISOString().split('T')[0], time: '10:00', duration: 1, purpose: 'ทำรายงาน' },
    { id: 3, studentId: '6501004', pcId: 'PC-007', date: new Date().toISOString().split('T')[0], time: '11:00', duration: 2, purpose: 'เขียนโปรแกรม' },
    { id: 4, studentId: '6501006', pcId: 'PC-010', date: new Date().toISOString().split('T')[0], time: '13:00', duration: 1, purpose: 'ทำงานกลุ่ม' },
    { id: 5, studentId: '6501008', pcId: 'PC-011', date: new Date().toISOString().split('T')[0], time: '14:00', duration: 3, purpose: 'วิเคราะห์ข้อมูล' },
    { id: 6, studentId: '6501009', pcId: 'PC-015', date: new Date().toISOString().split('T')[0], time: '15:00', duration: 2, purpose: 'ทำโปรเจกต์' },
    { id: 7, studentId: '6501010', pcId: 'PC-020', date: new Date().toISOString().split('T')[0], time: '16:00', duration: 1, purpose: 'ค้นคว้า' },

    // การจองวันถัดไป
    { id: 8, studentId: '6501002', pcId: 'PC-004', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '09:00', duration: 2, purpose: 'ทำโครงงาน' },
    { id: 9, studentId: '6501005', pcId: 'PC-008', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '10:00', duration: 3, purpose: 'พัฒนาเว็บไซต์' },
    { id: 10, studentId: '6501007', pcId: 'PC-012', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '11:00', duration: 2, purpose: 'วิเคราะห์ระบบ' },
    { id: 11, studentId: '6501011', pcId: 'PC-016', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '13:00', duration: 1, purpose: 'ตัดต่อวิดีโอ' },
    { id: 12, studentId: '6501013', pcId: 'PC-021', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '14:00', duration: 2, purpose: 'เขียนโปรแกรม' },
    { id: 13, studentId: '6501014', pcId: 'PC-023', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '15:00', duration: 1, purpose: 'ทำสื่อการสอน' },
    { id: 14, studentId: '6501015', pcId: 'PC-027', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '16:00', duration: 2, purpose: 'วิเคราะห์ธุรกิจ' },

    // การจอง 2 วันถัดไป
    { id: 15, studentId: '6501016', pcId: 'PC-001', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '09:00', duration: 2, purpose: 'ทดสอบระบบ' },
    { id: 16, studentId: '6501017', pcId: 'PC-006', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '10:00', duration: 1, purpose: 'ออกแบบ UI/UX' },
    { id: 17, studentId: '6501018', pcId: 'PC-010', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '11:00', duration: 3, purpose: 'ผลิตสื่อ' },
    { id: 18, studentId: '6501019', pcId: 'PC-015', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '14:00', duration: 2, purpose: 'วิเคราะห์ข้อมูล' },
    { id: 19, studentId: '6501020', pcId: 'PC-021', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '15:00', duration: 1, purpose: 'เรียน Data Science' },
    { id: 20, studentId: 'T001', pcId: 'PC-027', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '16:00', duration: 2, purpose: 'เตรียมสอน' }
  ],

  // ประวัติการใช้งาน (Usage Logs) - ขยายเป็น 50 รายการ
  usageLogs: generateUsageLogs(),

  // รายการซอฟต์แวร์ (ขยายเป็น 15 รายการ)
  software: [
    { id: 1, name: 'Microsoft Office', version: '2021', category: 'Office Suite', installedOn: Array.from({length: 30}, (_, i) => `PC-${String(i+1).padStart(3, '0')}`), license: 'Enterprise' },
    { id: 2, name: 'Visual Studio Code', version: '1.84', category: 'Development', installedOn: ['PC-001', 'PC-002', 'PC-004', 'PC-006', 'PC-008', 'PC-010', 'PC-013', 'PC-015', 'PC-018', 'PC-021', 'PC-023', 'PC-024', 'PC-027', 'PC-029'], license: 'Free' },
    { id: 3, name: 'Google Chrome', version: '119', category: 'Browser', installedOn: Array.from({length: 30}, (_, i) => `PC-${String(i+1).padStart(3, '0')}`), license: 'Free' },
    { id: 4, name: 'Python', version: '3.11', category: 'Programming Language', installedOn: ['PC-002', 'PC-004', 'PC-008', 'PC-013', 'PC-024'], license: 'Free' },
    { id: 5, name: 'Adobe Photoshop', version: 'CC 2023', category: 'Graphics', installedOn: ['PC-005', 'PC-022'], license: 'Enterprise' },
    { id: 6, name: 'Adobe Illustrator', version: 'CC 2023', category: 'Graphics', installedOn: ['PC-005', 'PC-022'], license: 'Enterprise' },
    { id: 7, name: 'PyCharm', version: '2023.2', category: 'Development', installedOn: ['PC-008', 'PC-024'], license: 'Educational' },
    { id: 8, name: 'IntelliJ IDEA', version: '2023.2', category: 'Development', installedOn: ['PC-013'], license: 'Educational' },
    { id: 9, name: 'Android Studio', version: '2023.1', category: 'Development', installedOn: ['PC-018'], license: 'Free' },
    { id: 10, name: 'Microsoft Edge', version: '119', category: 'Browser', installedOn: ['PC-014', 'PC-028'], license: 'Free' },
    { id: 11, name: 'Node.js', version: '20.9', category: 'Development', installedOn: ['PC-001', 'PC-002', 'PC-004', 'PC-008', 'PC-013'], license: 'Free' },
    { id: 12, name: 'Git', version: '2.42', category: 'Version Control', installedOn: Array.from({length: 20}, (_, i) => `PC-${String(i+1).padStart(3, '0')}`), license: 'Free' },
    { id: 13, name: 'MySQL Workbench', version: '8.0', category: 'Database', installedOn: ['PC-004', 'PC-008', 'PC-013', 'PC-018'], license: 'Free' },
    { id: 14, name: 'Postman', version: '10.18', category: 'API Testing', installedOn: ['PC-002', 'PC-008', 'PC-013'], license: 'Free' },
    { id: 15, name: 'Figma Desktop', version: '116.15', category: 'Design', installedOn: ['PC-005', 'PC-022'], license: 'Free' }
  ],

  // รายการคณะ
  faculties: [
    'วิทยาศาสตร์',
    'วิศวกรรมศาสตร์',
    'ครุศาสตร์',
    'มนุษยศาสตร์และสังคมศาสตร์',
    'บริหารธุรกิจ',
    'แพทยศาสตร์',
    'พยาบาลศาสตร์',
    'เภสัชศาสตร์',
    'ทันตแพทยศาสตร์',
    'สาธารณสุขศาสตร์'
  ],

  // รายการหลักสูตร
  programs: {
    'วิทยาศาสตร์': ['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', 'วิทยาการข้อมูล', 'เทคโนโลยีดิจิทัล'],
    'วิศวกรรมศาสตร์': ['วิศวกรรมคอมพิวเตอร์', 'วิศวกรรมซอฟต์แวร์', 'วิศวกรรมระบบสารสนเทศ'],
    'ครุศาสตร์': ['เทคโนโลยีการศึกษา', 'คอมพิวเตอร์ศึกษา'],
    'มนุษยศาสตร์และสังคมศาสตร์': ['นิเทศศาสตร์ดิจิทัล', 'สื่อดิจิทัล'],
    'บริหารธุรกิจ': ['ระบบสารสนเทศทางธุรกิจ', 'การจัดการเทคโนโลยี']
  }
};

// ฟังก์ชันสร้าง Usage Logs อัตโนมัติ
function generateUsageLogs() {
  const logs = [];
  const userIds = MOCK_DATA.students.map(s => s.id).concat(MOCK_DATA.externalUsers.map(e => e.id));
  const pcIds = Array.from({length: 30}, (_, i) => `PC-${String(i+1).padStart(3, '0')}`);
  const purposes = ['ทำโปรเจกต์', 'ทำรายงาน', 'เขียนโปรแกรม', 'ค้นคว้า', 'ทำงานกลุ่ม', 'วิเคราะห์ข้อมูล', 'ตัดต่อวิดีโอ', 'ออกแบบกราฟิก'];
  const feedbacks = ['ดีมาก', 'เครื่องใช้งานได้ดี', 'พอใจ', 'บริการดี', 'เมาส์ควรเปลี่ยนใหม่', 'คีย์บอร์ดดี', 'จอภาพชัดเจน', null];

  let logId = 1;

  // สร้าง logs ย้อนหลัง 7 วัน
  for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
    const numLogsPerDay = Math.floor(Math.random() * 10) + 10; // 10-20 logs ต่อวัน

    for (let i = 0; i < numLogsPerDay && logId <= 100; i++) {
      const date = new Date(Date.now() - dayOffset * 86400000);
      const hour = Math.floor(Math.random() * 10) + 8; // 8:00 - 17:00
      const minute = Math.floor(Math.random() * 60);
      const duration = Math.floor(Math.random() * 180) + 30; // 30-210 นาที

      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime.getTime() + duration * 60000);

      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const isExternal = userId.startsWith('ext-');
      const student = isExternal
        ? MOCK_DATA.externalUsers.find(e => e.id === userId)
        : MOCK_DATA.students.find(s => s.id === userId);

      const rating = Math.random() > 0.2 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 5) + 1; // มักได้ 4-5

      logs.push({
        id: logId++,
        userId: userId,
        userType: isExternal ? 'external' : 'internal',
        userName: isExternal ? `${student.firstName} ${student.lastName}` : `${student.firstName} ${student.lastName}`,
        faculty: isExternal ? 'บุคคลภายนอก' : student.faculty,
        pcId: pcIds[Math.floor(Math.random() * pcIds.length)],
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        rating: rating,
        feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
      });
    }
  }

  return logs;
}

// Configuration
const CONFIG = {
  API_DELAY: 1000,
  MAX_RESERVATION_HOURS: 4,
  COMPUTERS_PER_ROW: 5,
  MAX_SESSION_TIME: 120, // นาที (2 ชั่วโมง)
  WARNING_TIME: 10, // นาที (เตือนก่อนหมดเวลา 10 นาที)

  STORAGE_KEYS: {
    CURRENT_SESSION: 'checkin_current_session',
    USAGE_LOGS: 'checkin_usage_logs',
    COMPUTERS: 'checkin_computers',
    EXTERNAL_USERS: 'checkin_external_users',
    RESERVATIONS: 'checkin_reservations',
    SOFTWARE: 'checkin_software'
  }
};

// Initialize Local Storage
function initializeLocalStorage() {
  if (!localStorage.getItem(CONFIG.STORAGE_KEYS.COMPUTERS)) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.COMPUTERS, JSON.stringify(MOCK_DATA.computers));
  }
  if (!localStorage.getItem(CONFIG.STORAGE_KEYS.USAGE_LOGS)) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.USAGE_LOGS, JSON.stringify(MOCK_DATA.usageLogs));
  }
  if (!localStorage.getItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS)) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.EXTERNAL_USERS, JSON.stringify(MOCK_DATA.externalUsers));
  }
  if (!localStorage.getItem(CONFIG.STORAGE_KEYS.RESERVATIONS)) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.RESERVATIONS, JSON.stringify(MOCK_DATA.reservations));
  }
}

// เรียกใช้ทันทีเมื่อโหลดไฟล์
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}
