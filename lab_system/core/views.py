from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.db.models import Count, Avg
from django.views.decorators.http import require_POST
import csv
import datetime
import requests
import base64
import json

from .models import Computer, CheckInLog, Reservation, Software, Status

# ==========================================
# Helper Functions (จำลองการเชื่อมต่อระบบภายนอก)
# ==========================================

def reg_api(user_id):
    """
    เรียก API ดึงข้อมูลนักศึกษา/บุคลากรจาก UBU Reg API
    - ถ้า STUDENTYEAR > 0 = นักศึกษา
    - ถ้า STUDENTYEAR = 0 หรือไม่มี = บุคลากร
    """
    try:
        # เข้ารหัส user_id เป็น base64
        encoded_id = base64.b64encode(user_id.encode()).decode()

        # เรียก API
        url = "https://esapi.ubu.ac.th/api/v1/student/reg-data"
        payload = json.dumps({
            "loginName": encoded_id
        })
        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(url, headers=headers, data=payload, timeout=10)
        result = response.json()

        # ตรวจสอบ response
        if result.get('statusCode') == 200 and 'data' in result:
            data = result['data']

            # จัดรูปแบบข้อมูลให้ตรงกับระบบ
            full_name = f"{data.get('USERPREFIXNAME', '')} {data.get('USERNAME', '')} {data.get('USERSURNAME', '')}".strip()

            return {
                'success': True,
                'name': full_name,
                'faculty': data.get('FACULTYNAME', 'ไม่ระบุคณะ'),
                'year': data.get('STUDENTYEAR', 0),
                'level': data.get('LEVELNAME', 'ปริญญาตรี'),  # Default สำหรับนักศึกษา
                'department': data.get('DEPARTMENTNAME', ''),
            }
        elif result.get('statusCode') == 404:
            # ไม่พบข้อมูล
            return {
                'success': False,
                'error': 'ไม่พบข้อมูลนักศึกษาในระบบ'
            }
        elif result.get('statusCode') == 429:
            # Request มากเกินไป
            return {
                'success': False,
                'error': f"ระบบ API ไม่สามารถให้บริการได้ชั่วคราว กรุณารอ {result.get('retryAfter', 60)} วินาที"
            }
        else:
            # Error อื่นๆ
            return {
                'success': False,
                'error': 'เกิดข้อผิดพลาดในการเชื่อมต่อ API'
            }

    except requests.exceptions.Timeout:
        return {
            'success': False,
            'error': 'หมดเวลาการเชื่อมต่อ API (Timeout)'
        }
    except requests.exceptions.ConnectionError:
        return {
            'success': False,
            'error': 'ไม่สามารถเชื่อมต่อกับ API ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'
        }
    except Exception as e:
        # Fallback: ใช้ข้อมูลจำลองถ้า API ไม่ทำงาน
        return {
            'success': False,
            'error': f'เกิดข้อผิดพลาด: {str(e)}'
        }

def check_reservation(student_id, pc_id):
    """
    ตรวจสอบว่ามีชื่อจองในตาราง Reservation หรือไม่
    (เฉพาะนักศึกษาที่ต้องจอง)
    """
    now = timezone.now()
    # ค้นหาว่ามีการจองเครื่องนี้ ในวันนี้ และเวลานี้หรือไม่
    reservation = Reservation.objects.filter(
        student_id=student_id,
        pc=pc_id,
        booking_date=now.date(),
        start_time__lte=now.time(),
        end_time__gte=now.time()
    ).exists()

    # หมายเหตุ: ใน Prototype นี้ถ้าไม่มีข้อมูลจองใน DB อาจจะ return True เพื่อให้เทสผ่านง่ายๆ
    # แต่ถ้าต้องการ Strict ให้ลบบรรทัด 'return True' ด้านล่างทิ้ง
    return True # return reservation 

# ==========================================
# User Views (หน้าจอ Kiosk)
# ==========================================

def index(request):
    """หน้าจอ Idle แสดง QR Code และสถานะเครื่อง"""
    pc_id = request.GET.get('pc_id', 'PC-01')

    pc, pc_created = Computer.objects.get_or_create(pc_id=pc_id)
    status = 'available'
    if pc_created:
        status = Status.objects.create(computer=pc, status='available')
    else:
        status, status_created = Status.objects.get_or_create(computer=pc)

    # 2. คำนวณเวลาใช้งาน (สำหรับกรณี In Use)
    duration_minutes = 0
    if status.status == 'in_use' and status.start_time:
        diff = timezone.now() - status.start_time
        duration_minutes = int(diff.total_seconds() / 60)

    context = {
        'pc': pc,                           # ส่ง object Computer ไป
        'status': status,                   # ส่ง object Status ไป
        'duration_minutes': duration_minutes # ส่งค่าตัวเลขนาทีไป
    }

    return render(request, 'index.html', context)

def checkin(request, pc_id):
    """หน้าจอลงทะเบียนเข้าใช้งาน"""
    pc = get_object_or_404(Computer, pc_id=pc_id)

    # ป้องกันการเช็คอินซ้ำถ้าเครื่องไม่ว่าง
    if pc.status_info.status != 'available':
        messages.warning(request, f"เครื่อง {pc_id} ไม่ว่างในขณะนี้")
        return redirect(f"/?pc_id={pc_id}")

    if request.method == 'POST':
        user_type = request.POST.get('user_type')

        # ตัวแปรสำหรับบันทึก
        user_id = ""
        user_name = ""
        faculty_val = None
        year_val = None
        edu_level_val = None
        org_val = None
        final_user_type = user_type  # จะถูกแก้ไขภายหลังถ้าเป็น internal

        # --- Logic แยกตามประเภทผู้ใช้ ---
        if user_type == 'internal':
            # นักศึกษา หรือ บุคลากร (ดึงข้อมูลจาก reg_api)
            internal_id = request.POST.get('user_id')

            # 1. ดึงข้อมูลจาก Reg API
            info = reg_api(internal_id)

            # 2. ตรวจสอบว่า API ส่งข้อมูลกลับมาหรือไม่
            if not info.get('success'):
                messages.error(request, f"ไม่สามารถเข้าใช้งานได้: {info.get('error', 'ไม่พบข้อมูลในระบบ')}")
                return redirect('checkin', pc_id=pc_id)

            # 3. แยกประเภทตาม year: ถ้า year > 0 = นักศึกษา, ไม่เช่นนั้น = บุคลากร
            year = info.get('year', 0)

            user_id = internal_id
            user_name = info['name']
            faculty_val = info.get('faculty')
            messages.info(request, f"ยินดีต้อนรับ: {user_id} จากคณะ/หน่วยงาน {info.get('year')}")

            if year and year > 0:
                # นักศึกษา
                final_user_type = 'student'
                year_val = year
                edu_level_val = info.get('level', 'ปริญญาตรี')

                # ตรวจสอบการจอง (เฉพาะนักศึกษา)
                if not check_reservation(internal_id, pc_id):
                    messages.warning(request, "คุณไม่ได้จองใช้งานในช่วงเวลานี้ (ข้ามการตรวจสอบได้)")
                    # ไม่ return เพื่อให้เข้าใช้ได้แม้ไม่มีการจอง (optional)
            else:
                # บุคลากร
                final_user_type = 'staff'
                year_val = None
                edu_level_val = None

        elif user_type == 'external':
            # บุคคลภายนอก
            user_id = request.POST.get('id_card')
            user_name = request.POST.get('full_name')
            org_val = request.POST.get('organization')
            final_user_type = 'external'

        # --- อัปเดต Status (ไม่สร้าง Log) ---
        status = pc.status_info
        status.status = 'in_use'
        status.current_user_type = final_user_type  # ใช้ final_user_type แทน user_type
        status.current_user_id = user_id
        status.current_user_name = user_name
        status.faculty = faculty_val
        status.year_level = year_val
        status.education_level = edu_level_val
        status.organization = org_val
        status.start_time = timezone.now()
        status.save()

        messages.success(request, f"ยินดีต้อนรับ: {user_name}")
        return redirect(f"/?pc_id={pc_id}")

    return render(request, 'checkin.html', {'pc': pc})

def checkout(request, pc_id):
    """หน้าจอเช็คเอาท์และ Feedback"""
    pc = get_object_or_404(Computer, pc_id=pc_id)

    if request.method == 'POST':
        rating = request.POST.get('rating', 5)
        comment = request.POST.get('comment', '')

        # คัดลอกข้อมูลจาก Status → สร้าง CheckInLog
        status = pc.status_info
        if status.status == 'in_use':
            checkout_time = timezone.now()
            checkin_time = status.start_time or checkout_time

            # คำนวณระยะเวลา (นาที)
            diff = checkout_time - checkin_time
            minutes = int(diff.total_seconds() / 60)

            # สร้าง Log
            CheckInLog.objects.create(
                pc=pc_id,
                installed_sw=status.software or '-',
                user_type=status.current_user_type,
                user_id=status.current_user_id,
                user_name=status.current_user_name,
                faculty=status.faculty,
                year_level=status.year_level,
                education_level=status.education_level,
                organization=status.organization,
                checkin_time=checkin_time,
                checkout_time=checkout_time,
                duration_minutes=minutes,
                rating=int(rating),
                comment=comment
            )

            # Reset Status
            status.status = 'available'
            status.current_user_type = None
            status.current_user_id = None
            status.current_user_name = None
            status.faculty = None
            status.year_level = None
            status.education_level = None
            status.organization = None
            status.start_time = None
            status.save()

        messages.success(request, "ขอบคุณที่ใช้บริการ")
        return redirect(f"/?pc_id={pc_id}")

    return render(request, 'checkout.html', {'pc': pc})

# ==========================================
# Manager Views (ระบบหลังบ้าน)
# ==========================================

def manager_login(request):
    """หน้า Login ผู้ดูแลระบบ"""
    from django.contrib.auth import authenticate, login

    # ถ้า login แล้ว redirect ไปหน้า dashboard
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('dashboard')
        else:
            messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องเป็น Staff/Admin)')
            return redirect('index')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        next_url = request.POST.get('next', '/manager/dashboard/')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_staff or user.is_superuser:
                login(request, user)
                messages.success(request, f'ยินดีต้อนรับ {user.username}!')
                return redirect(next_url)
            else:
                messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึง (ต้องเป็น Staff/Admin เท่านั้น)')
        else:
            messages.error(request, 'Username หรือ Password ไม่ถูกต้อง')

    # ดึง next parameter จาก URL
    next_url = request.GET.get('next', '/manager/dashboard/')
    return render(request, 'manager/login.html', {'next': next_url})

def manager_logout(request):
    """ออกจากระบบผู้ดูแล"""
    from django.contrib.auth import logout
    logout(request)
    messages.success(request, 'ออกจากระบบเรียบร้อยแล้ว')
    return redirect('/')

def dashboard(request):
    """หน้า Dashboard ดูสถานะเครื่อง"""
    computers = Computer.objects.all().order_by('pc_id')

    total = computers.count()
    occupied = computers.filter(status_info__status='in_use').count()
    maintenance = computers.filter(status_info__status='disabled').count()
    available = computers.filter(status_info__status='available').count()

    context = {
        'computers': computers,
        'stats': {
            'total': total,
            'occupied': occupied,
            'maintenance': maintenance,
            'available': available
        }
    }
    return render(request, 'manager/dashboard.html', context)

def toggle_status(request, pc_id):
    """API สำหรับปุ่มเปิด/ปิดเครื่องใน Dashboard"""
    pc = get_object_or_404(Computer, pc_id=pc_id)
    status = pc.status_info

    if status.status == 'disabled':
        # เปิดใช้งานเครื่อง
        status.status = 'available'
        status.save()
    else:
        # ปิดปรับปรุง - ถ้ามีคนใช้ ให้ force checkout ก่อน
        if status.status == 'in_use':
            # สร้าง Log จาก Status ก่อนปิดเครื่อง
            checkout_time = timezone.now()
            checkin_time = status.start_time or checkout_time
            diff = checkout_time - checkin_time
            minutes = int(diff.total_seconds() / 60)

            CheckInLog.objects.create(
                pc=pc_id,
                installed_sw=status.software or '-',
                user_type=status.current_user_type,
                user_id=status.current_user_id,
                user_name=status.current_user_name,
                faculty=status.faculty,
                year_level=status.year_level,
                education_level=status.education_level,
                organization=status.organization,
                checkin_time=checkin_time,
                checkout_time=checkout_time,
                duration_minutes=minutes,
                rating=3,  # Default rating สำหรับ force checkout
                comment='Force checkout by admin'
            )

        # ปิดเครื่องและ reset ข้อมูล
        status.status = 'disabled'
        status.current_user_type = None
        status.current_user_id = None
        status.current_user_name = None
        status.faculty = None
        status.year_level = None
        status.education_level = None
        status.organization = None
        status.start_time = None
        status.save()

    return redirect('dashboard')

def report(request):
    """หน้ารายงานสถิติพร้อมฟังก์ชันกรองข้อมูล"""
    from django.db.models import Count, Avg

    # รับค่าจาก Query Parameters
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    user_type_filter = request.GET.get('user_type', 'all')

    # เริ่มต้นด้วย queryset ทั้งหมด
    logs = CheckInLog.objects.all()

    # กรองตามวันที่
    if start_date:
        from datetime import datetime
        start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
        logs = logs.filter(checkin_time__gte=start_datetime)

    if end_date:
        from datetime import datetime, timedelta
        end_datetime = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
        logs = logs.filter(checkin_time__lt=end_datetime)

    # กรองตามประเภทผู้ใช้
    if user_type_filter != 'all':
        logs = logs.filter(user_type=user_type_filter)

    # คำนวณสถิติสำหรับกราฟ
    # 1. สัดส่วนผู้ใช้งาน (User Type Distribution)
    user_type_stats = logs.values('user_type').annotate(count=Count('id')).order_by('user_type')

    student_count = 0
    staff_count = 0
    external_count = 0

    for stat in user_type_stats:
        if stat['user_type'] == 'student':
            student_count = stat['count']
        elif stat['user_type'] == 'staff':
            staff_count = stat['count']
        elif stat['user_type'] == 'external':
            external_count = stat['count']

    # 2. คะแนนความพึงพอใจ (Rating Distribution)
    rating_stats = logs.filter(rating__gt=0).values('rating').annotate(count=Count('id')).order_by('-rating')

    rating_5 = 0
    rating_4 = 0
    rating_3 = 0
    rating_2 = 0
    rating_1 = 0

    for stat in rating_stats:
        if stat['rating'] == 5:
            rating_5 = stat['count']
        elif stat['rating'] == 4:
            rating_4 = stat['count']
        elif stat['rating'] == 3:
            rating_3 = stat['count']
        elif stat['rating'] == 2:
            rating_2 = stat['count']
        elif stat['rating'] == 1:
            rating_1 = stat['count']

    # 3. คะแนนเฉลี่ย
    avg_rating = logs.filter(rating__gt=0).aggregate(Avg('rating'))['rating__avg'] or 0

    # ดึง Logs ล่าสุด 50 รายการ (หลังกรอง)
    recent_logs = logs.order_by('-checkin_time')[:50]

    context = {
        'logs': recent_logs,
        'student_count': student_count,
        'staff_count': staff_count,
        'external_count': external_count,
        'rating_5': rating_5,
        'rating_4': rating_4,
        'rating_3': rating_3,
        'rating_2': rating_2,
        'rating_1': rating_1,
        'avg_rating': round(avg_rating, 2),
        'total_logs': logs.count(),
        # ส่งค่ากรองกลับไปแสดงใน form
        'start_date': start_date,
        'end_date': end_date,
        'user_type_filter': user_type_filter,
    }

    return render(request, 'manager/report.html', context)

def export_csv(request):
    """ฟังก์ชันดาวน์โหลด CSV พร้อมข้อมูลครบถ้วน (รองรับการกรองข้อมูล)"""
    # รับค่าจาก Query Parameters (เหมือนกับหน้า report)
    start_date = request.GET.get('start_date', '')
    end_date = request.GET.get('end_date', '')
    user_type_filter = request.GET.get('user_type', 'all')

    # เริ่มต้นด้วย queryset ทั้งหมด
    logs = CheckInLog.objects.all()

    # กรองตามวันที่
    if start_date:
        from datetime import datetime
        start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
        logs = logs.filter(checkin_time__gte=start_datetime)

    if end_date:
        from datetime import datetime, timedelta
        end_datetime = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
        logs = logs.filter(checkin_time__lt=end_datetime)

    # กรองตามประเภทผู้ใช้
    if user_type_filter != 'all':
        logs = logs.filter(user_type=user_type_filter)

    # เรียงลำดับตามเวลา
    logs = logs.order_by('-checkin_time')

    # สร้าง filename ตามเงื่อนไขการกรอง
    filename_parts = ['usage_report']
    if start_date and end_date:
        filename_parts.append(f'{start_date}_to_{end_date}')
    elif start_date:
        filename_parts.append(f'from_{start_date}')
    elif end_date:
        filename_parts.append(f'until_{end_date}')

    if user_type_filter != 'all':
        filename_parts.append(user_type_filter)

    filename = '_'.join(filename_parts) + '.csv'

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response.write(u'\ufeff'.encode('utf8')) # BOM for Excel (ภาษาไทย)

    writer = csv.writer(response)

    # Header - เพิ่มข้อมูลครบทุก attribute
    writer.writerow([
        'Log ID',
        'PC ID',
        'User Type',
        'User ID',
        'User Name',
        'Faculty/Department',
        'Year Level',
        'Education Level',
        'Organization',
        'Check-in Time',
        'Check-out Time',
        'Duration (Minutes)',
        'Duration (Hours:Minutes)',
        'Rating',
        'Comment',
        'Software ประจำเครื่อง'
    ])

    for log in logs:
        # แปลงเวลาเป็น Local Time string
        checkin_str = timezone.localtime(log.checkin_time).strftime('%Y-%m-%d %H:%M:%S') if log.checkin_time else '-'
        checkout_str = timezone.localtime(log.checkout_time).strftime('%Y-%m-%d %H:%M:%S') if log.checkout_time else '-'

        # คำนวณระยะเวลาในรูปแบบ Hours:Minutes
        duration_formatted = '-'
        if log.duration_minutes:
            hours = log.duration_minutes // 60
            minutes = log.duration_minutes % 60
            duration_formatted = f"{hours}:{minutes:02d}"

        writer.writerow([
            log.id,
            log.pc,  # CharField แทน FK
            log.get_user_type_display(),
            log.user_id,
            log.user_name,
            log.faculty or '-',
            log.year_level or '-',
            log.education_level or '-',
            log.organization or '-',
            checkin_str,
            checkout_str,
            log.duration_minutes if log.duration_minutes else '-',
            duration_formatted,
            log.rating if log.rating else '-',
            log.comment or '-',
            log.installed_sw or '-'  # Software ประจำเครื่องที่บันทึกตอน checkin
        ])

    return response


# ==========================================
# Computer Management API
# ==========================================

@require_POST
def add_computer(request):
    """API สำหรับเพิ่มเครื่องคอมพิวเตอร์ใหม่"""
    pc_id = request.POST.get('pc_id', '').strip()
    ip_address = request.POST.get('ip_address', '').strip() or None
    initial_status = request.POST.get('status', 'available')

    # Validation
    if not pc_id:
        return JsonResponse({'success': False, 'message': 'กรุณาระบุ PC ID'})

    if Computer.objects.filter(pc_id=pc_id).exists():
        return JsonResponse({'success': False, 'message': f'PC ID {pc_id} มีอยู่แล้ว'})

    # Create computer and status
    try:
        computer = Computer.objects.create(
            pc_id=pc_id,
            ip_address=ip_address
        )
        # สร้าง Status พร้อมกัน
        Status.objects.create(
            computer=computer,
            status=initial_status
        )
        return JsonResponse({'success': True, 'message': f'เพิ่มเครื่อง {pc_id} สำเร็จ'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})


@require_POST
def update_computer_id(request, pc_id):
    """API สำหรับอัปเดต PC ID ของเครื่องคอมพิวเตอร์ (Computer model only)"""
    try:
        computer = get_object_or_404(Computer, pc_id=pc_id)

        # รับข้อมูลจาก request
        new_pc_id = request.POST.get('new_pc_id', '').strip()
        ip_address = request.POST.get('ip_address', '').strip() or None

        # Validation
        if not new_pc_id:
            return JsonResponse({'success': False, 'message': 'กรุณาระบุ PC ID'})

        # ตรวจสอบว่า PC ID ใหม่ซ้ำกับเครื่องอื่นหรือไม่
        if new_pc_id != pc_id and Computer.objects.filter(pc_id=new_pc_id).exists():
            return JsonResponse({'success': False, 'message': f'PC ID {new_pc_id} มีอยู่แล้ว'})

        # อัปเดต Computer model
        old_pc_id = computer.pc_id
        computer.pc_id = new_pc_id
        computer.ip_address = ip_address
        computer.save()

        return JsonResponse({
            'success': True,
            'message': f'เปลี่ยน PC ID จาก {old_pc_id} เป็น {new_pc_id} สำเร็จ'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})


@require_POST
def update_computer(request, pc_id):
    """API สำหรับอัปเดตสถานะและข้อมูลผู้ใช้ (Status model only)"""
    try:
        computer = get_object_or_404(Computer, pc_id=pc_id)
        status_obj = computer.status_info
        new_pc_id = pc_id
        ip_address = request.POST.get('ip_address', '').strip() or None

        # รับข้อมูลจาก request
        new_status = request.POST.get('status', status_obj.status)
        force_checkout = request.POST.get('force_checkout', 'false') == 'true'
        staff_id = request.POST.get('staff_id', '').strip()

        # ตรวจสอบการเปลี่ยนสถานะจาก "available" เป็น "in_use"
        if status_obj.status == 'available' and new_status == 'in_use':
            if not staff_id:
                return JsonResponse({'success': False, 'message': 'กรุณากรอกรหัสเจ้าหน้าที่'})

            # เรียก reg_api เพื่อตรวจสอบรหัสเจ้าหน้าที่
            info = reg_api(staff_id)

            if not info.get('success'):
                return JsonResponse({
                    'success': False,
                    'message': f'ไม่สามารถเปลี่ยนสถานะได้: {info.get("error", "ไม่พบข้อมูลเจ้าหน้าที่ในระบบ")}'
                })

            # ถ้าพบข้อมูล ให้บันทึกข้อมูลเจ้าหน้าที่ลง Status
            year = info.get('year', 0)

            # กำหนด user_type ตาม year
            if year and year > 0:
                # นักศึกษา (ไม่ควรเกิดกรณีนี้ แต่รองรับไว้)
                user_type = 'student'
                year_val = year
                edu_level_val = info.get('level', 'ปริญญาตรี')
            else:
                # บุคลากร
                user_type = 'staff'
                year_val = None
                edu_level_val = None

            # อัปเดต Status ด้วยข้อมูลเจ้าหน้าที่
            status_obj.status = 'in_use'
            status_obj.current_user_type = user_type
            status_obj.current_user_id = staff_id
            status_obj.current_user_name = info['name']
            status_obj.faculty = info.get('faculty')
            status_obj.year_level = year_val
            status_obj.education_level = edu_level_val
            status_obj.organization = None
            status_obj.start_time = timezone.now()
            status_obj.save()

            return JsonResponse({
                'success': True,
                'message': f'เปลี่ยนสถานะเป็น "ใช้งาน" สำเร็จ (ผู้ใช้: {info["name"]})'
            })

        # ตรวจสอบการเปลี่ยนสถานะจาก "in_use" เป็น "available" หรือ "disabled"
        if status_obj.status == 'in_use' and new_status in ['available', 'disabled']:
            if not force_checkout:
                # ส่งสัญญาณกลับให้ frontend แสดง confirmation
                current_user = status_obj.current_user_name or "ไม่ระบุชื่อ"
                return JsonResponse({
                    'success': False,
                    'require_confirmation': True,
                    'message': f'เครื่อง {pc_id} กำลังใช้งานโดย "{current_user}" คุณต้องการ Checkout ผู้ใช้งานนี้ออกหรือไม่?',
                    'current_user': current_user
                })
            else:
                # Force checkout - สร้าง Log จาก Status
                checkout_time = timezone.now()
                checkin_time = status_obj.start_time or checkout_time
                diff = checkout_time - checkin_time
                minutes = int(diff.total_seconds() / 60)

                CheckInLog.objects.create(
                    pc=pc_id,
                    installed_sw=status_obj.software or '-',
                    user_type=status_obj.current_user_type,
                    user_id=status_obj.current_user_id,
                    user_name=status_obj.current_user_name,
                    faculty=status_obj.faculty,
                    year_level=status_obj.year_level,
                    education_level=status_obj.education_level,
                    organization=status_obj.organization,
                    checkin_time=checkin_time,
                    checkout_time=checkout_time,
                    duration_minutes=minutes,
                    rating=3,
                    comment='Force checkout by admin (update_computer)'
                )

        # อัปเดตข้อมูลเครื่อง
        computer.pc_id = new_pc_id
        computer.ip_address = ip_address
        computer.save()

        # อัปเดต Status
        status_obj.status = new_status

        # ถ้าเปลี่ยนเป็น available หรือ disabled ให้ reset ข้อมูลผู้ใช้
        if new_status in ['available', 'disabled']:
            status_obj.current_user_type = None
            status_obj.current_user_id = None
            status_obj.current_user_name = None
            status_obj.faculty = None
            status_obj.year_level = None
            status_obj.education_level = None
            status_obj.organization = None
            status_obj.start_time = None

        status_obj.save()

        return JsonResponse({'success': True, 'message': f'อัปเดตเครื่อง {new_pc_id} สำเร็จ'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})


@require_POST
def delete_computer(request, pc_id):
    """API สำหรับลบเครื่องคอมพิวเตอร์"""
    try:
        computer = get_object_or_404(Computer, pc_id=pc_id)
        computer.delete()
        return JsonResponse({'success': True, 'message': f'ลบเครื่อง {pc_id} สำเร็จ'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})


@require_POST
def install_software(request):
    """API สำหรับติดตั้งซอฟต์แวร์ (แก้ไขเป็น 1 เครื่อง 1 โปรแกรม)"""
    try:
        pc_selection = request.POST.get('pc_selection', '')

        # แก้: รับค่ามาแค่ ID เดียว (ไม่ใช่ getlist)
        software_id = request.POST.get('software_id')

        if not software_id:
            return JsonResponse({'success': False, 'message': 'กรุณาเลือกซอฟต์แวร์'})

        # ดึง Object Software มาตัวเดียว
        software_obj = get_object_or_404(Software, id=software_id)
        software_name = str(software_obj)  # ใช้ __str__ method

        if pc_selection == 'all':
            # ติดตั้งทุกเครื่อง - อัปเดต status_info.software
            computers = Computer.objects.all()
            for computer in computers:
                status_obj = computer.status_info
                status_obj.software = software_name
                status_obj.save()
            count = computers.count()
            return JsonResponse({'success': True, 'message': f'ติดตั้ง {software_obj.name} ลงทุกเครื่องสำเร็จ'})
        else:
            # ติดตั้งเครื่องที่เลือก - อัปเดต status_info.software
            computer = get_object_or_404(Computer, pc_id=pc_selection)
            status_obj = computer.status_info
            status_obj.software = software_name
            status_obj.save()
            return JsonResponse({'success': True, 'message': f'ติดตั้ง {software_obj.name} ลงเครื่อง {pc_selection} สำเร็จ'})

    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})

# ==========================================
# Computer & Software Management Views
# ==========================================

def manage(request):
    """หน้าจัดการเครื่องคอมพิวเตอร์"""
    computers = Computer.objects.all().order_by('pc_id')
    software_list = Software.objects.all().order_by('name')
    return render(request, 'manager/manage.html', {
        'computers': computers,
        'software_list': software_list
    })

def manage_software(request):
    """หน้าจัดการซอฟต์แวร์"""
    software_list = Software.objects.all().order_by('name')
    return render(request, 'manager/manage_software.html', {'software_list': software_list})


@require_POST
def add_software(request):
    """API สำหรับเพิ่มซอฟต์แวร์ใหม่"""
    name = request.POST.get('name', '').strip()
    version = request.POST.get('version', '').strip()

    if not name:
        return JsonResponse({'success': False, 'message': 'กรุณาระบุชื่อซอฟต์แวร์'})

    try:
        software = Software.objects.create(
            name=name,
            version=version if version else None
        )
        return JsonResponse({
            'success': True,
            'message': f'เพิ่มซอฟต์แวร์ {name} สำเร็จ',
            'software': {
                'id': software.id,
                'name': software.name,
                'version': software.version or '-'
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})


@require_POST
def update_software(request, software_id):
    """API สำหรับอัปเดตข้อมูลซอฟต์แวร์"""
    try:
        software = get_object_or_404(Software, id=software_id)

        name = request.POST.get('name', '').strip()
        version = request.POST.get('version', '').strip()

        if not name:
            return JsonResponse({'success': False, 'message': 'กรุณาระบุชื่อซอฟต์แวร์'})

        software.name = name
        software.version = version if version else None
        software.save()

        return JsonResponse({'success': True, 'message': f'อัปเดตซอฟต์แวร์ {name} สำเร็จ'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})


@require_POST
def delete_software(request, software_id):
    """API สำหรับลบซอฟต์แวร์"""
    try:
        software = get_object_or_404(Software, id=software_id)
        software_name = software.name
        software.delete()
        return JsonResponse({'success': True, 'message': f'ลบซอฟต์แวร์ {software_name} สำเร็จ'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': f'เกิดข้อผิดพลาด: {str(e)}'})