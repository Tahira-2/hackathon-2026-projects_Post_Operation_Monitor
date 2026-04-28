#!/usr/bin/env python3
"""
Test script for simplified RAG functionality
Tests the /api/analyze endpoint with sample website data
"""

import requests
import json
from datetime import datetime

# Test data matching the expected format
test_data = {
    "basic_info": {
        "url": "https://example-wellness.com/services",
        "title": "Downtown Wellness Center - Acupuncture & Massage", 
        "domain": "example-wellness.com",
        "timestamp": datetime.now().isoformat() + "Z"
    },
    "page_content": """Downtown Wellness Center - Acupuncture & Massage

Professional acupuncture and massage therapy services in downtown area. 
Our licensed practitioners provide evidence-based treatments for pain relief, 
stress reduction, and overall wellness.

Services:
- Traditional Acupuncture ($120/session) - Licensed acupuncturist with 15 years experience
- Deep Tissue Massage ($95/session) - Therapeutic massage for muscle tension relief  
- Cupping Therapy ($80/session) - Traditional cupping for circulation improvement
- Consultation ($60) - Initial assessment and treatment planning

Contact Dr. Sarah Chen, Licensed Acupuncturist with 15 years experience.
Accepting new patients. Insurance accepted for covered services.

Hours: Monday-Friday 9AM-7PM, Saturday 9AM-5PM
Location: 123 Wellness St, Downtown District
Phone: (555) 123-4567"""
}

def test_analyze_endpoint():
    """Test the simplified /api/analyze endpoint"""
    
    url = "http://localhost:8000/api/analyze"
    
    print("🧪 Testing Policy Pilot /api/analyze endpoint...")
    print(f"📍 URL: {url}")
    print(f"📊 Website: {test_data['basic_info']['domain']}")
    
    try:
        response = requests.post(
            url, 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📈 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Policy Pilot Analysis Results:")
            print("=" * 50)
            
            print(f"📋 Summary: {result.get('summary', 'N/A')}")
            
            print(f"\n🔍 Match Checklist ({len(result.get('match_checklist', []))}):")
            for item in result.get('match_checklist', []):
                print(f"  {item['status']} {item['item']}: {item['details']}")
            
            service = result.get('benefits_services', {})
            print(f"\n🏥 Service Details:")
            print(f"   Service: {service.get('service_name', 'N/A')}")
            print(f"   Coverage: {service.get('coverage_type', 'N/A')}")
            print(f"   Copay: {service.get('copay', 'N/A')}")
            print(f"   Renewal: {service.get('renewal_date', 'N/A')}")
            
            print(f"\n📝 Recommendations ({len(result.get('recommendations', []))}):")
            for i, rec in enumerate(result.get('recommendations', []), 1):
                print(f"   {i}. {rec}")
            
            print("\n" + "=" * 50)
            print("✅ Test PASSED!")
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {str(e)}")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

def test_health_check():
    """Test that the server is running"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server health check passed")
            return True
        else:
            print(f"⚠️ Server health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not reachable: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Policy Pilot Test Suite - Simplified API")
    print("=" * 45)
    
    # First check if server is running
    if test_health_check():
        print()
        test_analyze_endpoint()
    else:
        print("\n💡 Start the server first:")
        print("   cd backend")
        print("   .venv\\Scripts\\activate") 
        print("   python main.py")