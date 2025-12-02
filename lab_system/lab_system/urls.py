from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls), # เข้าหลังบ้าน Django Admin
    path('', include('core.urls')),  # ส่งต่อ URL ทั้งหมดไปที่ core/urls.py
]