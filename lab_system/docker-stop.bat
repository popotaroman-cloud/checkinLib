@echo off
echo ========================================
echo   Stopping Lab Check-in System
echo ========================================
echo.

echo Stopping all containers...
docker-compose stop

echo.
echo ========================================
echo   System stopped successfully!
echo ========================================
echo.
echo To start again: docker-run.bat
echo To remove everything: docker-compose down -v
echo.
pause
