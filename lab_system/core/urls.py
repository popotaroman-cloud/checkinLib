# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('checkin/<str:pc_id>/', views.checkin, name='checkin'),
    path('checkout/<str:pc_id>/', views.checkout, name='checkout'),

    # Manager Routes
    path('manager/dashboard/', views.dashboard, name='dashboard'),
    path('manager/report/', views.report, name='report'),
    path('manager/export/', views.export_csv, name='export_csv'),
    path('manager/login/', views.manager_login, name='manager_login'),
    path('manager/logout/', views.manager_logout, name='manager_logout'),
    path('manager/manage/', views.manage, name='manage'),
    path('manager/software/', views.manage_software, name='manage_software'),
    # API
    path('api/toggle-status/<str:pc_id>/', views.toggle_status, name='toggle_status'),
    path('api/add-computer/', views.add_computer, name='add_computer'),
    path('api/update-computer-id/<str:pc_id>/', views.update_computer_id, name='update_computer_id'),
    path('api/update-computer/<str:pc_id>/', views.update_computer, name='update_computer'),
    path('api/delete-computer/<str:pc_id>/', views.delete_computer, name='delete_computer'),
    path('api/install-software/', views.install_software, name='install_software'),
    path('api/add-software/', views.add_software, name='add_software'),
    path('api/update-software/<int:software_id>/', views.update_software, name='update_software'),
    path('api/delete-software/<int:software_id>/', views.delete_software, name='delete_software'),
]