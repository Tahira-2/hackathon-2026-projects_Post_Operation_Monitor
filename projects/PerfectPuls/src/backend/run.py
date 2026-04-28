#!/usr/bin/env python3
"""
Policy Pilot Backend Startup Script
"""

import sys
import os
from pathlib import Path

def check_environment():
    """Check if environment is properly configured"""
    print("🔧 Checking environment configuration...")
    
    # Check if .env exists
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found")
        print("   Run: copy example.env .env")
        print("   Then edit .env with your API keys")
        return False
    
    # Check Python version
    if sys.version_info < (3, 8):
        print(f"❌ Python {sys.version} is too old. Requires Python 3.8+")
        return False
    
    print("✅ Environment check passed")
    return True

def install_dependencies():
    """Check if dependencies are installed"""
    print("📦 Checking dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import google.generativeai
        print("✅ Core dependencies found")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("   Run: pip install -r requirements.txt")
        return False

def main():
    """Main startup function"""
    print("🚀 Policy Pilot Backend Startup")
    print("=" * 40)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Check dependencies
    if not install_dependencies():
        sys.exit(1)
    
    print()
    print("🎯 Starting backend server...")
    print("📋 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("🛑 Press Ctrl+C to stop")
    print()
    
    # Import and run the app
    try:
        from main import app
        import uvicorn
        
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🔄 Backend stopped by user")
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()