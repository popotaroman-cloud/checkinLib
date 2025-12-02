from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages
from django.conf import settings


class AdminAuthenticationMiddleware:
    """
    Middleware สำหรับบังคับให้ล็อกอินก่อนเข้าหน้า /manager/ และ /api/
    ยกเว้น login page และ Kiosk pages
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Redirect /admin/login/ to /manager/login/
        if request.path == '/admin/login/':
            next_url = request.GET.get('next', '')
            if next_url:
                return redirect(f'/manager/login/?next={next_url}')
            return redirect('/manager/login/')

        # เส้นทางที่ต้อง authenticate
        protected_paths = ['/manager/', '/api/']

        # เส้นทางที่ยกเว้น (ไม่ต้อง authenticate)
        exempt_paths = [
            '/manager/login/',  # หน้า login ไม่ต้อง auth
            '/manager/logout/',  # อนุญาตให้ logout ได้โดยไม่ต้อง auth
            '/admin/',  # Django admin มี auth เอง
            '/static/',
            '/media/',
        ]

        # ตรวจสอบว่า path ปัจจุบันอยู่ใน protected paths หรือไม่
        path = request.path
        is_protected = any(path.startswith(protected_path) for protected_path in protected_paths)
        is_exempt = any(path.startswith(exempt_path) for exempt_path in exempt_paths)

        # ถ้าเป็น protected path และไม่ใช่ exempt
        if is_protected and not is_exempt:
            # ตรวจสอบว่า user ล็อกอินแล้วและเป็น staff
            if not request.user.is_authenticated:
                messages.warning(request, 'กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้')
                return redirect(f'/manager/login/?next={request.path}')

            if not request.user.is_staff:
                messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องเป็น Admin เท่านั้น)')
                return redirect('/')

        response = self.get_response(request)
        return response
