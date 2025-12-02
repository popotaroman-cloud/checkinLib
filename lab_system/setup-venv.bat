@echo off
REM Setup Virtual Environment for Django Lab System

echo ========================================
echo Setting up Virtual Environment
echo ========================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo.
echo Python version:
python --version

REM Check if venv exists
if exist "venv\" (
    echo.
    echo Virtual environment already exists.
    set /p RECREATE="Do you want to recreate it? (y/N): "
    if /i not "%RECREATE%"=="y" (
        echo Skipping venv creation...
        goto :install_deps
    )
    echo Removing old virtual environment...
    rmdir /s /q venv
)

echo.
echo Creating virtual environment...
python -m venv venv

if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Virtual environment created successfully!

:install_deps
echo.
echo ========================================
echo Installing Dependencies
echo ========================================

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo.
echo Installing requirements from requirements.txt...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Failed to install requirements
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Virtual environment is ready at: %CD%\venv
echo.
echo To activate the virtual environment:
echo   venv\Scripts\activate
echo.
echo To run Django server:
echo   python manage.py runserver
echo.
echo To run with VSCode:
echo   Press F5 and select "Django: Run Server"
echo.
pause
