from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from .models import Computer, CheckInLog
import datetime

class LabSystemTests(TestCase):
    
    def setUp(self):
        """
        ทำงานก่อนเริ่ม Test แต่ละฟังก์ชัน
        เราจะสร้างเครื่องคอมพิวเตอร์จำลองขึ้นมา 1 เครื่อง
        """
        self.client = Client()
        self.pc_id = 'PC-TEST-01'
        self.computer = Computer.objects.create(
            pc_id=self.pc_id,
            status='available'
        )

    def test_index_view(self):
        """ทดสอบว่าหน้า Index โหลดได้ปกติ"""
        url = reverse('index') # หรือใช้ '/' 
        response = self.client.get(f"{url}?pc_id={self.pc_id}")
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.pc_id)
        self.assertContains(response, "ว่าง (Available)")

    def test_checkin_student(self):
        """ทดสอบการเช็คอินของนักศึกษา"""
        url = reverse('checkin', args=[self.pc_id])
        
        # จำลองการส่ง Form (POST)
        data = {
            'user_type': 'student',
            'student_id': '66011234'
        }
        response = self.client.post(url, data)

        # 1. ต้อง Redirect กลับไปหน้าแรก
        self.assertEqual(response.status_code, 302) 
        
        # 2. สถานะเครื่องต้องเปลี่ยนเป็น 'occupied'
        self.computer.refresh_from_db()
        self.assertEqual(self.computer.status, 'occupied')
        self.assertIn("นศ.", self.computer.current_user_name) # เช็คว่า Mock API ทำงาน

        # 3. ต้องมี Log เกิดขึ้นใน Database
        log = CheckInLog.objects.last()
        self.assertEqual(log.user_id, '66011234')
        self.assertEqual(log.user_type, 'student')
        self.assertIsNotNone(log.checkin_time)

    def test_checkin_external(self):
        """ทดสอบการเช็คอินของบุคคลภายนอก"""
        url = reverse('checkin', args=[self.pc_id])
        data = {
            'user_type': 'external',
            'id_card': '1100220033445',
            'full_name': 'นายทดสอบ บุคคลนอก',
            'organization': 'บริษัท ABC'
        }
        self.client.post(url, data)
        
        log = CheckInLog.objects.last()
        self.assertEqual(log.user_type, 'external')
        self.assertEqual(log.organization, 'บริษัท ABC')

    def test_checkout_and_duration(self):
        """ทดสอบการเช็คเอาท์ และการคำนวณเวลา"""
        # 1. สร้างสถานการณ์ว่ามีการเช็คอินไว้แล้วเมื่อ 1 ชั่วโมงที่แล้ว
        past_time = timezone.now() - datetime.timedelta(hours=1, minutes=30)
        
        self.computer.status = 'occupied'
        self.computer.save()
        
        log = CheckInLog.objects.create(
            pc=self.computer,
            user_type='student',
            user_id='555',
            user_name='Test User'
        )
        # Hack เวลาเช็คอินย้อนหลัง (ต้อง update แยกเพราะ auto_now_add จะ fix ค่าตอน create)
        CheckInLog.objects.filter(id=log.id).update(checkin_time=past_time)

        # 2. ทำการเช็คเอาท์
        url = reverse('checkout', args=[self.pc_id])
        data = {
            'rating': 5,
            'comment': 'Good Service'
        }
        self.client.post(url, data)

        # 3. ตรวจสอบผลลัพธ์
        self.computer.refresh_from_db()
        log.refresh_from_db()

        self.assertEqual(self.computer.status, 'available') # เครื่องต้องว่าง
        self.assertIsNotNone(log.checkout_time) # ต้องมีเวลาออก
        self.assertEqual(log.rating, 5)
        
        # ตรวจสอบว่าคำนวณเวลาถูกต้อง (1 ชม 30 นาที = 90 นาที)
        # อาจมีความคลาดเคลื่อนระดับวินาที ให้เช็คว่าอยู่ในช่วง 89-91 นาที
        self.assertTrue(89 <= log.duration_minutes <= 91)

    def test_prevent_double_checkin(self):
        """ทดสอบว่าถ้าเครื่องไม่ว่าง จะเช็คอินซ้ำไม่ได้"""
        # ทำให้เครื่องไม่ว่างก่อน
        self.computer.status = 'occupied'
        self.computer.save()

        # พยายามเช็คอินซ้ำ
        url = reverse('checkin', args=[self.pc_id])
        data = {'user_type': 'student', 'student_id': '999'}
        response = self.client.post(url, data)

        # ควร Redirect และมี Message warning (แต่ใน Unit test เช็คแค่ Log ไม่เพิ่มก็พอ)
        self.assertEqual(CheckInLog.objects.count(), 0) # Log ต้องไม่เพิ่ม