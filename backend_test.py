#!/usr/bin/env python3
"""
Backend API Testing Suite for Jewellery Platform
Tests all endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class JewelleryAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                if params:
                    response = self.session.post(url, headers=headers, params=params, timeout=10)
                else:
                    response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"   Response: {response.text[:200]}", "FAIL")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}
                
        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "ERROR")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}
    
    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "api/health")
    
    def test_gold_prices(self):
        """Test gold price endpoints"""
        success, data = self.run_test("Get Gold Prices", "GET", "api/gold-price")
        if success:
            required_fields = ['gold_24k', 'gold_22k', 'gold_18k', 'silver', 'timestamp', 'source']
            for field in required_fields:
                if field not in data:
                    self.log(f"❌ Missing field in gold price response: {field}", "FAIL")
                    return False
            self.log(f"   Gold prices: 24K=₹{data['gold_24k']}, 22K=₹{data['gold_22k']}, Source={data['source']}")
        return success
    
    def test_price_calculator(self):
        """Test price calculator"""
        params = {
            'weight': 10,
            'purity': '22K',
            'labour_per_gram': 500,
            'include_gst': True
        }
        success, data = self.run_test("Price Calculator", "POST", "api/calculate-price", 200, data=None, params=params)
        if success:
            if 'breakdown' not in data or 'estimate_range' not in data:
                self.log("❌ Missing breakdown or estimate_range in calculator response", "FAIL")
                return False
            self.log(f"   Calculated total: ₹{data['breakdown']['total']}")
        return success
    
    def test_goldsmith_profile(self):
        """Test goldsmith profile endpoints"""
        return self.run_test("Get Goldsmith Profile", "GET", "api/goldsmith")
    
    def test_jewellery_catalogue(self):
        """Test jewellery catalogue endpoints"""
        # Test get all jewellery
        success, data = self.run_test("Get All Jewellery", "GET", "api/jewellery")
        if success:
            if 'items' not in data:
                self.log("❌ Missing 'items' field in jewellery response", "FAIL")
                return False
            self.log(f"   Found {len(data['items'])} jewellery items")
            
            # Test with filters
            filters = {
                'type': 'necklace',
                'purity': '22K',
                'featured': True
            }
            filter_success, filter_data = self.run_test("Get Filtered Jewellery", "GET", "api/jewellery", params=filters)
            if filter_success:
                self.log(f"   Filtered results: {len(filter_data.get('items', []))} items")
            
            # Test get single item if items exist
            if data['items']:
                item_id = data['items'][0]['item_id']
                single_success, single_data = self.run_test("Get Single Jewellery Item", "GET", f"api/jewellery/{item_id}")
                if single_success:
                    self.log(f"   Single item: {single_data.get('name', 'Unknown')}")
                return single_success
        return success
    
    def test_education_content(self):
        """Test education content endpoint"""
        success, data = self.run_test("Get Education Content", "GET", "api/education")
        if success:
            if 'articles' not in data:
                self.log("❌ Missing 'articles' field in education response", "FAIL")
                return False
            self.log(f"   Found {len(data['articles'])} education articles")
        return success
    
    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+91 9876543210",
            "subject": "general",
            "message": "This is a test message from automated testing."
        }
        success, data = self.run_test("Submit Contact Form", "POST", "api/contact", 200, contact_data)
        if success:
            if 'inquiry_id' not in data:
                self.log("❌ Missing 'inquiry_id' in contact response", "FAIL")
                return False
            self.log(f"   Contact inquiry ID: {data['inquiry_id']}")
        return success
    
    def test_order_intent(self):
        """Test order intent submission"""
        order_data = {
            "customer_name": "Test Customer",
            "customer_email": "customer@example.com",
            "customer_phone": "+91 9876543210",
            "occasion": "wedding",
            "timeline": "1-month",
            "items": [
                {"name": "Test Necklace", "item_id": "TEST001", "estimate": 50000}
            ],
            "total_estimate": 50000,
            "message": "Test order intent from automated testing"
        }
        success, data = self.run_test("Submit Order Intent", "POST", "api/order-intent", 200, order_data)
        if success:
            if 'order_id' not in data:
                self.log("❌ Missing 'order_id' in order intent response", "FAIL")
                return False
            self.log(f"   Order intent ID: {data['order_id']}")
        return success
    
    def test_ai_chat(self):
        """Test AI chat functionality"""
        chat_data = {
            "message": "What is the difference between 22K and 24K gold?",
            "session_id": f"test_session_{uuid.uuid4().hex[:8]}"
        }
        success, data = self.run_test("AI Chat", "POST", "api/chat", 200, chat_data)
        if success:
            if 'response' not in data:
                self.log("❌ Missing 'response' in chat response", "FAIL")
                return False
            self.log(f"   AI response length: {len(data['response'])} characters")
        return success
    
    def test_cloudinary_signature(self):
        """Test Cloudinary signature generation"""
        params = {'resource_type': 'image', 'folder': 'jewellery'}
        # This might fail if Cloudinary is not configured, which is expected
        success, data = self.run_test("Cloudinary Signature", "GET", "api/cloudinary/signature", params=params)
        if not success:
            self.log("   Note: Cloudinary not configured (expected)", "INFO")
        return True  # Don't fail the test suite for this
    
    def run_all_tests(self):
        """Run all API tests"""
        self.log("Starting Jewellery Platform API Tests")
        self.log("=" * 50)
        
        # Core functionality tests
        tests = [
            self.test_health_check,
            self.test_gold_prices,
            self.test_price_calculator,
            self.test_goldsmith_profile,
            self.test_jewellery_catalogue,
            self.test_education_content,
            self.test_contact_form,
            self.test_order_intent,
            self.test_ai_chat,
            self.test_cloudinary_signature
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log(f"❌ Test {test.__name__} crashed: {str(e)}", "ERROR")
                self.failed_tests.append({
                    "test": test.__name__,
                    "error": f"Test crashed: {str(e)}"
                })
            self.log("-" * 30)
        
        # Print summary
        self.log("=" * 50)
        self.log(f"SUMMARY: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            self.log("FAILED TESTS:")
            for failure in self.failed_tests:
                error_msg = failure.get('error', f"Status {failure.get('actual')} != {failure.get('expected')}")
                self.log(f"  - {failure['test']}: {error_msg}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    # Test local backend
    local_tester = JewelleryAPITester("http://localhost:8001")
    local_success = local_tester.run_all_tests()
    
    print("\n" + "="*60)
    
    # Test external backend if available
    external_tester = JewelleryAPITester("https://demobackend.emergentagent.com")
    print("Testing External Backend (if available)...")
    external_success = external_tester.test_health_check()
    
    if not external_success:
        print("❌ External backend not accessible - this needs to be configured")
        print("   Frontend will not work without proper REACT_APP_BACKEND_URL")
    
    return 0 if local_success else 1

if __name__ == "__main__":
    sys.exit(main())