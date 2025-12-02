# 🔐 Authentication Guide - Lab Check-in System

## Overview

ระบบใช้ Custom Middleware สำหรับจัดการ Authentication และ Authorization

---

## 📌 Authentication Flow

### 1. Protected Routes (ต้อง Login)

- **`/manager/*`** - ทุกหน้าผู้ดูแล (Dashboard, Manage, Report, Software)
- **`/api/*`** - ทุก API endpoints

### 2. Exempt Routes (ไม่ต้อง Login)

- **`/manager/login/`** - หน้า Login ผู้ดูแล
- **`/manager/logout/`** - Logout ผู้ดูแล
- **`/admin/*`** - Django Admin (มี auth ของตัวเอง)
- **`/`** - Kiosk หน้าแรก
- **`/checkin/<pc_id>/`** - หน้า Check-in
- **`/checkout/<pc_id>/`** - หน้า Check-out
- **`/static/*`** - Static files
- **`/media/*`** - Media files

---

## 🔄 Redirect Flow

### Scenario 1: เข้า /manager/dashboard/ โดยไม่ได้ Login

```
1. User เข้า http://localhost/manager/dashboard/
2. Middleware ตรวจสอบ → ยังไม่ได้ login
3. Redirect ไป /manager/login/?next=/manager/dashboard/
4. User login สำเร็จ
5. Redirect กลับไปที่ /manager/dashboard/
```

### Scenario 2: เข้า /admin/login/

```
1. User เข้า http://localhost/admin/login/
2. Middleware จับ → Redirect ไป /manager/login/
3. แสดงหน้า Manager Login
```

### Scenario 3: เข้า /admin/login/?next=/manager/report/

```
1. User เข้า http://localhost/admin/login/?next=/manager/report/
2. Middleware จับ → Redirect ไป /manager/login/?next=/manager/report/
3. User login สำเร็จ
4. Redirect กลับไปที่ /manager/report/
```

---

## 👥 User Requirements

### ต้องเป็น Staff หรือ Superuser

```python
if not request.user.is_staff:
    messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องเป็น Admin เท่านั้น)')
    return redirect('/')
```

### Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Type**: Superuser (สร้างอัตโนมัติจาก entrypoint.sh)

---

## 🛠️ Technical Implementation

### 1. Settings Configuration ([settings.py:154-157](lab_system/settings.py#L154-L157))

```python
# Authentication settings
LOGIN_URL = '/manager/login/'
LOGIN_REDIRECT_URL = '/manager/dashboard/'
LOGOUT_REDIRECT_URL = '/'
```

### 2. Middleware ([core/middleware.py](core/middleware.py))

```python
class AdminAuthenticationMiddleware:
    def __call__(self, request):
        # Redirect /admin/login/ to /manager/login/
        if request.path == '/admin/login/':
            next_url = request.GET.get('next', '')
            if next_url:
                return redirect(f'/manager/login/?next={next_url}')
            return redirect('/manager/login/')

        # Protected paths
        protected_paths = ['/manager/', '/api/']

        # Exempt paths
        exempt_paths = [
            '/manager/login/',
            '/manager/logout/',
            '/admin/',
            '/static/',
            '/media/',
        ]

        # Check authentication
        if is_protected and not is_exempt:
            if not request.user.is_authenticated:
                messages.warning(request, 'กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้')
                return redirect(f'/manager/login/?next={request.path}')

            if not request.user.is_staff:
                messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
                return redirect('/')
```

### 3. Login View ([core/views.py:286-317](core/views.py#L286-L317))

```python
def manager_login(request):
    # Already logged in?
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('dashboard')
        else:
            messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
            return redirect('index')

    # Handle POST
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
                messages.error(request, 'คุณไม่มีสิทธิ์เข้าถึง (ต้องเป็น Staff/Admin)')
        else:
            messages.error(request, 'Username หรือ Password ไม่ถูกต้อง')

    # Render login form
    next_url = request.GET.get('next', '/manager/dashboard/')
    return render(request, 'manager/login.html', {'next': next_url})
```

### 4. Logout View ([core/views.py:319-324](core/views.py#L319-L324))

```python
def manager_logout(request):
    logout(request)
    messages.success(request, 'ออกจากระบบเรียบร้อยแล้ว')
    return redirect('/')
```

---

## 🧪 Testing

### Test 1: Access Protected Route (Not Logged In)

```bash
curl -I http://localhost/manager/dashboard/
# Expected: Redirect to /manager/login/?next=/manager/dashboard/
```

### Test 2: Login with Valid Credentials

```bash
curl -X POST http://localhost/manager/login/ \
  -d "username=admin&password=admin123&csrfmiddlewaretoken=xxx"
# Expected: Redirect to /manager/dashboard/
```

### Test 3: Access /admin/login/

```bash
curl -I http://localhost/admin/login/
# Expected: Redirect to /manager/login/
```

### Test 4: Logout

```bash
curl http://localhost/manager/logout/
# Expected: Redirect to /
```

---

## 📋 URLs Configuration

### Manager Routes ([core/urls.py](core/urls.py))

```python
urlpatterns = [
    # Kiosk (Public)
    path('', views.index, name='index'),
    path('checkin/<str:pc_id>/', views.checkin, name='checkin'),
    path('checkout/<str:pc_id>/', views.checkout, name='checkout'),

    # Manager (Protected)
    path('manager/dashboard/', views.dashboard, name='dashboard'),
    path('manager/report/', views.report, name='report'),
    path('manager/export/', views.export_csv, name='export_csv'),
    path('manager/manage/', views.manage, name='manage'),
    path('manager/software/', views.manage_software, name='manage_software'),

    # Auth (Exempt)
    path('manager/login/', views.manager_login, name='manager_login'),
    path('manager/logout/', views.manager_logout, name='manager_logout'),

    # API (Protected)
    path('api/toggle-status/<str:pc_id>/', views.toggle_status, name='toggle_status'),
    path('api/add-computer/', views.add_computer, name='add_computer'),
    # ... more API routes
]
```

---

## ⚠️ Security Notes

1. **CSRF Protection**: ทุก POST request ต้องมี CSRF token
2. **Session-Based Auth**: ใช้ Django sessions (cookie-based)
3. **Password Hashing**: Django ใช้ PBKDF2 algorithm
4. **Staff-Only Access**: ต้องเป็น `is_staff=True` หรือ `is_superuser=True`

---

## 🔑 Creating New Admin Users

### Via Django Admin

1. Login: http://localhost/admin/
2. ไป Users → Add user
3. กรอก username, password
4. เลือก **Staff status** ✅
5. Save

### Via Docker Shell

```bash
docker-compose exec web python manage.py createsuperuser
```

### Via Code

```python
from django.contrib.auth.models import User

# Create staff user
user = User.objects.create_user(
    username='staff1',
    password='password123',
    is_staff=True
)

# Create superuser
admin = User.objects.create_superuser(
    username='admin2',
    password='admin456'
)
```

---

## 📚 Related Files

- [core/middleware.py](core/middleware.py) - Custom authentication middleware
- [core/views.py](core/views.py) - Login/Logout views
- [core/urls.py](core/urls.py) - URL routing
- [lab_system/settings.py](lab_system/settings.py) - Django settings
- [templates/manager/login.html](templates/manager/login.html) - Login page
- [templates/manager/base_manager.html](templates/manager/base_manager.html) - Base template with logout

---

**Last Updated**: 2025-11-30
