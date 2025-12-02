@echo off
echo ========================================
echo Database Reset and Migration Script
echo ========================================
echo.

echo [1/5] Removing old database...
if exist instance\db.sqlite3 (
    del /f instance\db.sqlite3
    echo Database deleted successfully.
) else (
    echo No database file found.
)
echo.

echo [2/5] Creating migrations...
python manage.py makemigrations
if %errorlevel% neq 0 (
    echo ERROR: Failed to create migrations
    pause
    exit /b 1
)
echo.

echo [3/5] Applying migrations...
python manage.py migrate
if %errorlevel% neq 0 (
    echo ERROR: Failed to apply migrations
    pause
    exit /b 1
)
echo.

echo [4/5] Creating superuser (optional)...
echo You can skip this step by pressing Ctrl+C
python manage.py createsuperuser
echo.

echo [5/5] All done!
echo ========================================
echo.
echo Next steps:
echo   1. Run: python manage.py runserver
echo   2. Open: http://127.0.0.1:8000/?pc_id=PC-01
echo   3. Admin: http://127.0.0.1:8000/admin
echo.
pause
