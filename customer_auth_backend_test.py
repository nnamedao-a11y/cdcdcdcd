#!/usr/bin/env python3
"""
BIBI Cars CRM - Customer Auth & Retention Backend API Testing
Testing customer authentication, saved listings, recently viewed, and SEO clusters
"""

import requests
import sys
import time
import json
from datetime import datetime

class CustomerAuthAPITester:
    def __init__(self, base_url="https://accessible-web-7.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.customer_token = None
        self.customer_id = None
        
        # Test credentials from review request
        self.test_email = "testcust6@example.com"
        self.test_password = "test123456"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Print response details for successful tests
                try:
                    json_data = response.json()
                    if isinstance(json_data, dict):
                        if 'accessToken' in json_data:
                            print(f"   Access Token: Present")
                            print(f"   Customer ID: {json_data.get('customerId', 'N/A')}")
                        elif 'email' in json_data:
                            print(f"   Email: {json_data.get('email', 'N/A')}")
                        elif isinstance(json_data, list):
                            print(f"   Found {len(json_data)} items")
                        elif 'success' in json_data:
                            print(f"   Success: {json_data.get('success')}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.content else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_customer_registration(self):
        """Test customer registration endpoint"""
        print("\n" + "="*60)
        print("TESTING CUSTOMER REGISTRATION")
        print("="*60)
        
        # Generate unique email for testing
        timestamp = int(time.time())
        test_email = f"testuser{timestamp}@example.com"
        
        registration_data = {
            "email": test_email,
            "password": "testpass123",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "Customer Registration",
            "POST",
            "api/customer-auth/register",
            201,
            data=registration_data
        )
        
        if success:
            self.customer_token = response.get('accessToken')
            self.customer_id = response.get('customerId')
            print(f"   Registration successful for: {test_email}")
            return True
        
        return False

    def test_customer_login(self):
        """Test customer login endpoint"""
        print("\n" + "="*60)
        print("TESTING CUSTOMER LOGIN")
        print("="*60)
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test(
            "Customer Login",
            "POST",
            "api/customer-auth/login",
            201,
            data=login_data
        )
        
        if success:
            self.customer_token = response.get('accessToken')
            self.customer_id = response.get('customerId')
            print(f"   Login successful for: {self.test_email}")
            return True
        else:
            # Try registration if login fails
            print("   Login failed, attempting registration...")
            return self.test_customer_registration()
        
        return False

    def test_customer_profile(self):
        """Test protected /me endpoint"""
        print("\n" + "="*60)
        print("TESTING CUSTOMER PROFILE (/me)")
        print("="*60)
        
        if not self.customer_token:
            print("❌ No customer token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.customer_token}'
        }
        
        success, response = self.run_test(
            "Customer Profile (/me)",
            "GET",
            "api/customer-auth/me",
            200,
            headers=headers
        )
        
        if success:
            print(f"   Profile retrieved successfully")
            print(f"   Email: {response.get('email', 'N/A')}")
            print(f"   Verified: {response.get('isVerified', 'N/A')}")
            print(f"   Login Count: {response.get('loginCount', 'N/A')}")
            return True
        
        return False

    def test_saved_listings(self):
        """Test saved listings functionality"""
        print("\n" + "="*60)
        print("TESTING SAVED LISTINGS")
        print("="*60)
        
        if not self.customer_token:
            print("❌ No customer token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.customer_token}'
        }
        
        # Test getting saved listings (should be empty initially)
        success1, response1 = self.run_test(
            "Get Saved Listings (Empty)",
            "GET",
            "api/customer-auth/me/saved",
            200,
            headers=headers
        )
        
        # Test saving a listing
        save_data = {
            "listingId": "test-listing-123",
            "title": "Test BMW X5",
            "price": 45000,
            "image": "https://example.com/bmw.jpg",
            "slug": "test-bmw-x5-123"
        }
        
        success2, response2 = self.run_test(
            "Save Listing",
            "POST",
            "api/customer-auth/me/saved",
            201,
            data=save_data,
            headers=headers
        )
        
        # Test getting saved listings again (should have 1 item)
        success3, response3 = self.run_test(
            "Get Saved Listings (With Items)",
            "GET",
            "api/customer-auth/me/saved",
            200,
            headers=headers
        )
        
        # Test checking if listing is saved
        success4, response4 = self.run_test(
            "Check Listing Saved Status",
            "GET",
            "api/customer-auth/me/saved/test-listing-123/check",
            200,
            headers=headers
        )
        
        # Test removing saved listing
        success5, response5 = self.run_test(
            "Remove Saved Listing",
            "DELETE",
            "api/customer-auth/me/saved/test-listing-123",
            200,
            headers=headers
        )
        
        return all([success1, success2, success3, success4, success5])

    def test_recently_viewed(self):
        """Test recently viewed functionality"""
        print("\n" + "="*60)
        print("TESTING RECENTLY VIEWED")
        print("="*60)
        
        if not self.customer_token:
            print("❌ No customer token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.customer_token}'
        }
        
        # Test getting recently viewed (should be empty initially)
        success1, response1 = self.run_test(
            "Get Recently Viewed (Empty)",
            "GET",
            "api/customer-auth/me/recently-viewed",
            200,
            headers=headers
        )
        
        # Test adding to recently viewed
        view_data = {
            "listingId": "test-listing-456",
            "title": "Test Mercedes GLE",
            "price": 55000,
            "image": "https://example.com/mercedes.jpg",
            "slug": "test-mercedes-gle-456"
        }
        
        success2, response2 = self.run_test(
            "Add Recently Viewed",
            "POST",
            "api/customer-auth/me/recently-viewed",
            201,
            data=view_data,
            headers=headers
        )
        
        # Test getting recently viewed again (should have 1 item)
        success3, response3 = self.run_test(
            "Get Recently Viewed (With Items)",
            "GET",
            "api/customer-auth/me/recently-viewed",
            200,
            headers=headers
        )
        
        # Test clearing recently viewed
        success4, response4 = self.run_test(
            "Clear Recently Viewed",
            "DELETE",
            "api/customer-auth/me/recently-viewed",
            200,
            headers=headers
        )
        
        return all([success1, success2, success3, success4])

    def test_seo_clusters_public(self):
        """Test SEO clusters public API"""
        print("\n" + "="*60)
        print("TESTING SEO CLUSTERS PUBLIC API")
        print("="*60)
        
        # Test getting all public clusters
        success1, response1 = self.run_test(
            "Get Public SEO Clusters",
            "GET",
            "api/seo-clusters/public",
            200
        )
        
        if success1:
            clusters = response1 if isinstance(response1, list) else []
            print(f"   Found {len(clusters)} SEO clusters")
            
            # Test with type filter if clusters exist
            if clusters:
                success2, response2 = self.run_test(
                    "Get Public SEO Clusters - Brand Filter",
                    "GET",
                    "api/seo-clusters/public?type=brand",
                    200
                )
                
                # Test getting cluster by slug if available
                if clusters and len(clusters) > 0:
                    first_cluster = clusters[0]
                    slug = first_cluster.get('slug')
                    if slug:
                        success3, response3 = self.run_test(
                            f"Get SEO Cluster by Slug - {slug}",
                            "GET",
                            f"api/seo-clusters/public/{slug}",
                            200
                        )
                        return all([success1, success2, success3])
                
                return all([success1, success2])
        
        return success1

    def test_auth_error_handling(self):
        """Test authentication error handling"""
        print("\n" + "="*60)
        print("TESTING AUTH ERROR HANDLING")
        print("="*60)
        
        # Test login with invalid credentials
        invalid_login = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        self.run_test(
            "Login - Invalid Credentials",
            "POST",
            "api/customer-auth/login",
            401,
            data=invalid_login
        )
        
        # Test registration with existing email
        existing_email = {
            "email": self.test_email,
            "password": "newpassword123",
            "name": "Duplicate User"
        }
        
        self.run_test(
            "Registration - Existing Email",
            "POST",
            "api/customer-auth/register",
            400,
            data=existing_email
        )
        
        # Test protected endpoint without token
        self.run_test(
            "Protected Endpoint - No Token",
            "GET",
            "api/customer-auth/me",
            401
        )
        
        # Test protected endpoint with invalid token
        invalid_headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer invalid-token-12345'
        }
        
        self.run_test(
            "Protected Endpoint - Invalid Token",
            "GET",
            "api/customer-auth/me",
            401,
            headers=invalid_headers
        )

def main():
    print("🔐 BIBI Cars CRM - Customer Auth & Retention API Testing")
    print("=" * 70)
    
    tester = CustomerAuthAPITester()
    
    # Run all tests
    try:
        # Test authentication flow
        login_success = tester.test_customer_login()
        profile_success = tester.test_customer_profile()
        
        # Test retention features
        saved_success = tester.test_saved_listings()
        viewed_success = tester.test_recently_viewed()
        
        # Test SEO clusters
        seo_success = tester.test_seo_clusters_public()
        
        # Test error handling
        tester.test_auth_error_handling()
        
        # Print final results
        print("\n" + "="*70)
        print("📊 FINAL TEST RESULTS")
        print("="*70)
        print(f"Tests Run: {tester.tests_run}")
        print(f"Tests Passed: {tester.tests_passed}")
        print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
        
        # Feature-specific results
        print("\n🔐 Customer Auth & Retention Results:")
        print(f"   Customer Login: {'✅' if login_success else '❌'}")
        print(f"   Customer Profile: {'✅' if profile_success else '❌'}")
        print(f"   Saved Listings: {'✅' if saved_success else '❌'}")
        print(f"   Recently Viewed: {'✅' if viewed_success else '❌'}")
        print(f"   SEO Clusters: {'✅' if seo_success else '❌'}")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1
            
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())