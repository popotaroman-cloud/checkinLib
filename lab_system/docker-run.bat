@echo off
echo ========================================
echo   Lab Check-in System - Docker Runner
echo ========================================
echo.

echo [1/3] Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build images
    pause
    exit /b 1
)
echo.

echo [2/3] Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)
echo.

echo [3/3] Waiting for services to be ready...
timeout /t 10 /nobreak >nul
echo.

echo ========================================
echo   System is ready!
echo ========================================
echo.
echo Services:
echo   - Kiosk:         http://localhost/?pc_id=PC-01
echo   - Admin Panel:   http://localhost/admin/
echo   - Dashboard:     http://localhost/manager/dashboard/
echo   - phpMyAdmin:    http://localhost:8080/
echo   - Nginx:         http://localhost/
echo.
echo Default Admin Account:
echo   Username: admin
echo   Password: admin123
echo.
echo ========================================
echo.
echo Press any key to view logs (Ctrl+C to exit)...
pause >nul

echo.
echo Showing realtime logs...
docker-compose logs -f
