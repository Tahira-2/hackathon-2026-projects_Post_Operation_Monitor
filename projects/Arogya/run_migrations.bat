@echo off
echo ========================================
echo Arogya - Database Migration Script
echo ========================================
echo.

cd /d "%~dp0src\backend\Arogya"

echo Current directory: %CD%
echo.

echo Activating virtual environment...
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo Virtual environment activated!
) else (
    echo ERROR: Virtual environment not found at .venv\Scripts\activate.bat
    echo Please create a virtual environment first.
    pause
    exit /b 1
)
echo.

echo Running makemigrations...
python manage.py makemigrations
if %errorlevel% neq 0 (
    echo ERROR: makemigrations failed!
    pause
    exit /b 1
)
echo.

echo Running migrate...
python manage.py migrate
if %errorlevel% neq 0 (
    echo ERROR: migrate failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Migrations completed successfully!
echo ========================================
echo.
echo You can now start the server with:
echo python manage.py runserver 0.0.0.0:8000
echo.

pause
