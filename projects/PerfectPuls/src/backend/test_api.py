#!/usr/bin/env python3
"""
Quick test script for Policy Pilot Backend
"""
import asyncio
import aiohttp
import os
from pathlib import Path

API_BASE_URL = "http://localhost:8000"

async def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{API_BASE_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health check passed: {data['message']}")
                    return True
                else:
                    print(f"❌ Health check failed: HTTP {response.status}")
                    return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False

async def test_pdf_upload(pdf_path: str = None):
    """Test PDF upload endpoint with a sample file"""
    print("📄 Testing PDF upload...")
    
    if not pdf_path or not os.path.exists(pdf_path):
        print("⚠️  No PDF file provided or file not found")
        print("   Create a sample PDF or provide path to test upload")
        return False
    
    async with aiohttp.ClientSession() as session:
        try:
            with open(pdf_path, 'rb') as pdf_file:
                data = aiohttp.FormData()
                data.add_field('file', pdf_file, filename='test_policy.pdf', content_type='application/pdf')
                data.add_field('policy_name', 'Test Health Insurance Policy')
                data.add_field('upload_source', 'test')
                
                async with session.post(f"{API_BASE_URL}/api/process-pdf", data=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"✅ PDF upload successful!")
                        print(f"   Policy ID: {result['policy_id']}")
                        print(f"   Status: {result['status']}")
                        print(f"   Entities extracted: {result['extraction_summary']['entities_extracted']}")
                        print(f"   Processing time: {result['processing_time_ms']}ms")
                        return True
                    else:
                        error_data = await response.text()
                        print(f"❌ PDF upload failed: HTTP {response.status}")
                        print(f"   Error: {error_data}")
                        return False
        except Exception as e:
            print(f"❌ PDF upload error: {e}")
            return False

async def main():
    """Run all tests"""
    print("🧪 Policy Pilot Backend Test Suite")
    print("=" * 50)
    
    # Test health check
    health_ok = await test_health_check()
    
    if not health_ok:
        print("❌ Backend is not running. Start with: python main.py")
        return
    
    print()
    
    # Test PDF upload (using your sample file)
    sample_pdf = "sample-pd/sample_policy_insurance.pdf"
    await test_pdf_upload(sample_pdf)
    
    print()
    print("🎯 Test completed!")
    print(f"📋 View API docs at: {API_BASE_URL}/docs")

if __name__ == "__main__":
    asyncio.run(main())