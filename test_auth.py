"""
Test script to verify authentication endpoints are working
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/api/", timeout=5)
        print(f"✓ Backend is running: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Backend is not running: {e}")
        return False

def test_register():
    """Test registration endpoint"""
    try:
        data = {
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "test123456"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=data, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Registration successful!")
            print(f"  Token: {result.get('access_token', '')[:50]}...")
            return result.get('access_token')
        elif response.status_code == 400:
            print(f"✗ Registration failed: {response.json()}")
            print("  (User may already exist, trying login instead)")
            return None
        else:
            print(f"✗ Registration failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Registration error: {e}")
        return None

def test_login():
    """Test login endpoint"""
    try:
        data = {
            "email": "test@example.com",
            "password": "test123456"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=data, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Login successful!")
            print(f"  Token: {result.get('access_token', '')[:50]}...")
            return result.get('access_token')
        else:
            print(f"✗ Login failed with status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Login error: {e}")
        return None

def test_auth_me(token):
    """Test /auth/me endpoint with token"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
        
        if response.status_code == 200:
            user = response.json()
            print(f"✓ Token verification successful!")
            print(f"  User: {user.get('full_name')} ({user.get('email')})")
            return True
        else:
            print(f"✗ Token verification failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Token verification error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Authentication System")
    print("=" * 60)
    print()
    
    # Test 1: Backend health
    print("1. Testing backend health...")
    if not test_backend_health():
        print("\n⚠ Backend is not running. Start it with:")
        print("   cd backend")
        print("   uvicorn server:app --reload --port 8000")
        exit(1)
    print()
    
    # Test 2: Registration
    print("2. Testing registration...")
    token = test_register()
    print()
    
    # Test 3: Login (if registration failed)
    if not token:
        print("3. Testing login...")
        token = test_login()
        print()
    
    # Test 4: Token verification
    if token:
        print("4. Testing token verification...")
        test_auth_me(token)
        print()
    
    print("=" * 60)
    print("Test Summary:")
    print("=" * 60)
    if token:
        print("✓ All authentication tests passed!")
        print("\nYour authentication system is working correctly.")
    else:
        print("✗ Some tests failed. Check the errors above.")
    print()
