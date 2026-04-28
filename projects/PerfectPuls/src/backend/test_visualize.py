import requests

print("🔍 Testing visualization endpoint...")
try:
    response = requests.get("http://localhost:8000/api/visualize-current-policy")
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"Content Length: {len(response.text)}")
    print("\n" + "="*50)
    print("HTML CONTENT:")
    print("="*50)
    print(response.text)
    print("="*50)
    
    # Check for common issues
    if "lib/bindings/utils.js" in response.text:
        print("⚠️  Found reference to lib/bindings/utils.js - this might cause JS errors")
    if "<script" in response.text:
        print("✅ Contains JavaScript")
    if "vis.js" in response.text or "vis-network" in response.text:
        print("✅ Contains vis.js references")
    if "mynetworkid" in response.text or "network" in response.text.lower():
        print("✅ Contains network container")
        
except Exception as e:
    print(f"❌ Error: {e}")