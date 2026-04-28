@echo off
echo ========================================
echo  Arogya Backend Server
echo ========================================
echo.

cd /d "%~dp0src\backend\Arogya"

echo [1/2] Activating virtual environment...
call .venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Could not activate virtual environment.
    pause
    exit /b 1
)

echo [2/2] Running migrations...
python manage.py migrate --run-syncdb

echo.
echo ========================================
echo  Server starting on ALL network interfaces
echo  Localhost : http://localhost:8000
echo  Network   : http://192.168.100.40:8000
echo  Admin     : http://localhost:8000/admin
echo ========================================
echo.
echo  IMPORTANT: Your phone MUST use:
echo  http://192.168.100.40:8000
echo.
echo  Press Ctrl+C to stop the server
echo ========================================
echo.

python manage.py runserver 0.0.0.0:8000
