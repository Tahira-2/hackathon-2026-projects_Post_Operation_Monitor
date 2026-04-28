@echo off
echo 🏥 CausalCare AI - Setup Script
echo ================================
echo.

REM Step 1: Train ML Model
echo 📊 Step 1: Training ML Model...
pip install pandas scikit-learn numpy joblib
python ml_service\train_model.py

if not exist "ml_service\disease_model.pkl" (
    echo ❌ Model training failed!
    exit /b 1
)
echo ✅ Model trained successfully
echo.

REM Step 2: Initialize Database
echo 💾 Step 2: Initializing Database...
python database\init_db.py
echo ✅ Database initialized
echo.

REM Step 3: Install Backend Dependencies
echo 🔧 Step 3: Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
cd ..
echo ✅ Backend dependencies installed
echo.

REM Step 4: Install Frontend Dependencies
echo 🎨 Step 4: Installing Frontend Dependencies...
cd frontend
call npm install
call npm install -D tailwindcss postcss autoprefixer
cd ..
echo ✅ Frontend dependencies installed
echo.

echo 🎉 Setup Complete!
echo.
echo To start the application:
echo 1. Backend:  cd backend ^&^& python main.py
echo 2. Frontend: cd frontend ^&^& npm start
echo.
echo Then open: http://localhost:3000
