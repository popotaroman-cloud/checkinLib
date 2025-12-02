from django.db import models
from django.utils import timezone

# 1. ตารางเก็บรายชื่อ Software (สำหรับระบุว่าเครื่องไหนมีโปรแกรมอะไรบ้าง)
class Software(models.Model):
    name = models.CharField(max_length=100, verbose_name="ชื่อโปรแกรม")
    version = models.CharField(max_length=50, blank=True, null=True, verbose_name="เวอร์ชัน")

    def __str__(self):
        return f"{self.name} ({self.version})" if self.version else self.name

    class Meta:
        verbose_name = "ซอฟต์แวร์"
        verbose_name_plural = "ข้อมูลซอฟต์แวร์"


# 2. ตารางข้อมูลเครื่องคอมพิวเตอร์
class Computer(models.Model):
    pc_id = models.CharField(max_length=20, primary_key=True, verbose_name="หมายเลขเครื่อง (PC ID)")
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name="IP Address")

    def __str__(self):
        return self.pc_id

    class Meta:
        verbose_name = "เครื่องคอมพิวเตอร์"
        verbose_name_plural = "จัดการเครื่องคอมพิวเตอร์"


# 3. ตารางสถานะเครื่องคอมพิวเตอร์ (Status) - เก็บข้อมูลสถานะปัจจุบัน
class Status(models.Model):
    STATUS_CHOICES = [
        ('in_use', 'ใช้อยู่'),
        ('available', 'ว่าง'),
        ('disabled', 'ปิดใช้บริการ'),
    ]

    USER_TYPES = [
        ('student', 'นักศึกษา'),
        ('staff', 'เจ้าหน้าที่/บุคลากร'),
        ('external', 'บุคคลภายนอก'),
    ]

    computer = models.OneToOneField(
        Computer,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='status_info',
        verbose_name="เครื่องคอมพิวเตอร์"
    )

    # ข้อมูลเครื่อง
    software = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Software ประจำเครื่อง"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available',
        verbose_name="สถานะ"
    )

    # ข้อมูลผู้ใช้ปัจจุบัน (จะมีค่าเมื่อ status = 'in_use')
    current_user_type = models.CharField(
        max_length=10,
        choices=USER_TYPES,
        blank=True,
        null=True,
        verbose_name="ประเภทผู้ใช้"
    )
    current_user_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="รหัสประจำตัว/เลขบัตร ปชช."
    )
    current_user_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="ชื่อ-นามสกุล"
    )

    # ข้อมูลเพิ่มเติม (สำหรับ Internal)
    faculty = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="คณะ/หน่วยงาน"
    )
    year_level = models.IntegerField(
        blank=True,
        null=True,
        verbose_name="ชั้นปี"
    )
    education_level = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="ระดับการศึกษา"
    )

    # ข้อมูลเพิ่มเติม (สำหรับ External)
    organization = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="หน่วยงานภายนอก"
    )

    # เวลา
    start_time = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="เวลาเริ่มใช้งาน"
    )

    def __str__(self):
        return f"{self.computer.pc_id} - {self.get_status_display()}"

    class Meta:
        verbose_name = "สถานะเครื่อง"
        verbose_name_plural = "สถานะเครื่องคอมพิวเตอร์"


# 4. ตารางการจอง (Reservation) - สำหรับ Admin นำเข้าข้อมูล
class Reservation(models.Model):
    student_id = models.CharField(max_length=50, verbose_name="รหัสนักศึกษา/ผู้จอง")
    pc = models.CharField(max_length=20, blank=True, null=True, verbose_name="หมายเลขเครื่อง")
    software = models.CharField(max_length=100, blank=True, null=True, verbose_name="ซอฟต์แวร์")
    booking_date = models.DateField(verbose_name="วันที่จอง")
    start_time = models.TimeField(verbose_name="เวลาเริ่ม")
    end_time = models.TimeField(verbose_name="เวลาสิ้นสุด")

    def __str__(self):
        return f"{self.student_id} จอง {self.pc} ({self.booking_date})"

    class Meta:
        verbose_name = "รายการจอง"
        verbose_name_plural = "ข้อมูลการจอง"


# 5. ตารางบันทึกการใช้งาน (Log) - บันทึกประวัติเมื่อ checkout เท่านั้น
class CheckInLog(models.Model):
    USER_TYPES = [
        ('student', 'นักศึกษา'),
        ('staff', 'เจ้าหน้าที่/บุคลากร'),
        ('external', 'บุคคลภายนอก'),
    ]

    pc = models.CharField(max_length=50, verbose_name="หมายเลขเครื่อง (PC ID)")
    installed_sw = models.TextField(blank=True, null=True, verbose_name="Software ประจำเครื่อง")
    user_type = models.CharField(max_length=10, choices=USER_TYPES, verbose_name="ประเภทผู้ใช้")

    # ข้อมูลพื้นฐาน (มีทุกกลุ่ม)
    user_id = models.CharField(max_length=50, verbose_name="รหัสประจำตัว/เลขบัตร ปชช.")
    user_name = models.CharField(max_length=100, verbose_name="ชื่อ-นามสกุล")

    # สำหรับ Internal (นักศึกษา และ เจ้าหน้าที่)
    faculty = models.CharField(max_length=100, blank=True, null=True, verbose_name="คณะ/หน่วยงาน")

    # เฉพาะ นักศึกษา (Student Only)
    year_level = models.IntegerField(blank=True, null=True, verbose_name="ชั้นปี")
    education_level = models.CharField(max_length=50, blank=True, null=True, verbose_name="ระดับการศึกษา")

    # เฉพาะ บุคคลภายนอก (External Only)
    organization = models.CharField(max_length=100, blank=True, null=True, verbose_name="หน่วยงานภายนอก")

    # เวลา, Feedback
    checkin_time = models.DateTimeField(verbose_name="เวลาเข้า")
    checkout_time = models.DateTimeField(blank=True, null=True, verbose_name="เวลาออก")
    duration_minutes = models.IntegerField(default=0, verbose_name="ระยะเวลา (นาที)")
    rating = models.IntegerField(default=5, verbose_name="คะแนน")
    comment = models.TextField(blank=True, verbose_name="ข้อเสนอแนะ")

    def __str__(self):
        return f"{self.user_name} ({self.get_user_type_display()})"

    class Meta:
        ordering = ['-checkin_time']
        verbose_name = "บันทึกการใช้งาน"
        verbose_name_plural = "ประวัติการใช้งาน"
