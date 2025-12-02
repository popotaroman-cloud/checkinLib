from django.contrib import admin
from .models import Computer, Software, Reservation, CheckInLog, Status

# 1. จัดการ Software
@admin.register(Software)
class SoftwareAdmin(admin.ModelAdmin):
    list_display = ('name', 'version')
    search_fields = ('name',)

# 2. จัดการ Computer
@admin.register(Computer)
class ComputerAdmin(admin.ModelAdmin):
    list_display = ('pc_id', 'ip_address')
    search_fields = ('pc_id',)
    ordering = ('pc_id',)

# 3. จัดการ Status
@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ('computer', 'status', 'current_user_name', 'start_time', 'software')
    list_filter = ('status', 'current_user_type')
    search_fields = ('current_user_name', 'current_user_id')
    ordering = ('computer',)

    # เพิ่ม Action พิเศษ: สั่ง Reset สถานะเครื่องเป็น 'ว่าง' ทีละหลายเครื่องได้
    actions = ['mark_as_available', 'mark_as_disabled']

    @admin.action(description='เปลี่ยนสถานะเป็น "ว่าง (Available)"')
    def mark_as_available(self, request, queryset):
        queryset.update(
            status='available',
            current_user_type=None,
            current_user_id=None,
            current_user_name=None,
            faculty=None,
            year_level=None,
            education_level=None,
            organization=None,
            start_time=None
        )

    @admin.action(description='เปลี่ยนสถานะเป็น "ปิดใช้บริการ (Disabled)"')
    def mark_as_disabled(self, request, queryset):
        queryset.update(
            status='disabled',
            current_user_type=None,
            current_user_id=None,
            current_user_name=None,
            faculty=None,
            year_level=None,
            education_level=None,
            organization=None,
            start_time=None
        )

# 4. จัดการ Reservation (การจอง)
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'pc', 'software', 'booking_date', 'start_time', 'end_time')
    list_filter = ('booking_date',)
    search_fields = ('student_id', 'pc')
    date_hierarchy = 'booking_date' # มีแถบเลือกวันด้านบน

# 5. จัดการ CheckInLog (ประวัติการใช้งาน)
@admin.register(CheckInLog)
class CheckInLogAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'user_type', 'pc', 'checkin_time', 'checkout_time', 'duration_minutes', 'rating')
    list_filter = ('user_type', 'pc', 'checkin_time', 'faculty', 'rating')
    search_fields = ('user_name', 'user_id', 'organization', 'faculty')
    readonly_fields = ('checkin_time',) # ป้องกันการแก้เวลาเข้าโดยไม่ตั้งใจ
    date_hierarchy = 'checkin_time' # แถบเลือกช่วงเวลา

    # จัดกลุ่มฟิลด์ในหน้าแก้ไข เพื่อให้อ่านง่าย
    fieldsets = (
        ('ข้อมูลการใช้งาน', {
            'fields': ('pc', 'user_type', 'checkin_time', 'checkout_time', 'duration_minutes')
        }),
        ('ข้อมูลผู้ใช้', {
            'fields': ('user_id', 'user_name', 'faculty', 'year_level', 'education_level', 'organization')
        }),
        ('Feedback', {
            'fields': ('rating', 'comment')
        }),
    )