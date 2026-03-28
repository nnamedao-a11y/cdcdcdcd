#!/usr/bin/env python3
"""
BIBI Cars CRM - Customer Cabinet Backend Testing
Tests Customer Cabinet API endpoints for client portal functionality
"""

import requests
import sys
import json
from datetime import datetime
import time

class CustomerCabinetAPITester:
    def __init__(self, base_url="https://a11y-project-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        # Test credentials from review request
        self.test_customer_id = "eab5b3fa-1b46-439e-a043-d3efdcffef57"
        self.test_deal_id = "7539a7c4-7bca-4384-99c4-2ef44c87bd62"

    def log(self, message):
        """Log test messages"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        self.log(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 1000:
                        self.log(f"   Response keys: {list(response_data.keys())}")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    self.log(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    self.log(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Request timeout (30s)")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin authentication"""
        self.log("\n=== TESTING ADMIN LOGIN ===")
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            201,
            data={
                "email": "admin@crm.com",
                "password": "admin123"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log(f"✅ Token obtained: {self.token[:20]}...")
            return True
        elif success and 'token' in response:
            self.token = response['token']
            self.log(f"✅ Token obtained: {self.token[:20]}...")
            return True
        else:
            self.log("❌ No token in response")
            return False

    def test_customer_cabinet_dashboard(self):
        """Test GET /api/customer-cabinet/:customerId/dashboard"""
        self.log("\n=== TESTING CUSTOMER CABINET DASHBOARD ===")
        
        success, response = self.run_test(
            "Customer Cabinet Dashboard",
            "GET",
            f"customer-cabinet/{self.test_customer_id}/dashboard",
            200
        )
        
        if success:
            # Check required fields in dashboard response
            required_fields = ['customer', 'summary', 'activeDeals', 'pendingDeposits', 'latestTimeline']
            missing_fields = [field for field in response if field not in required_fields]
            
            if 'customer' in response and 'summary' in response:
                self.log("✅ Dashboard contains required fields")
                
                # Check customer data
                customer = response['customer']
                self.log(f"   Customer: {customer.get('firstName', '')} {customer.get('lastName', '')}")
                
                # Check summary data
                summary = response['summary']
                self.log(f"   Summary - Active Leads: {summary.get('activeLeads', 0)}")
                self.log(f"   Summary - Active Deals: {summary.get('activeDeals', 0)}")
                self.log(f"   Summary - Pending Deposits: {summary.get('pendingDeposits', 0)}")
                self.log(f"   Summary - Total Value: ${summary.get('totalValue', 0)}")
                
                # Check arrays
                self.log(f"   Data - Active Deals: {len(response.get('activeDeals', []))}")
                self.log(f"   Data - Pending Deposits: {len(response.get('pendingDeposits', []))}")
                self.log(f"   Data - Timeline Events: {len(response.get('latestTimeline', []))}")
                
                return True
            else:
                self.log(f"❌ Missing required fields in dashboard response")
                return False
        return False

    def test_customer_cabinet_orders(self):
        """Test GET /api/customer-cabinet/:customerId/orders"""
        self.log("\n=== TESTING CUSTOMER CABINET ORDERS ===")
        
        success, response = self.run_test(
            "Customer Cabinet Orders",
            "GET",
            f"customer-cabinet/{self.test_customer_id}/orders",
            200
        )
        
        if success:
            if 'data' in response and 'meta' in response:
                orders_count = len(response['data'])
                self.log(f"✅ Found {orders_count} orders")
                
                meta = response['meta']
                self.log(f"   Total: {meta.get('total', 0)}, Page: {meta.get('page', 1)}")
                
                # Check order structure if any orders exist
                if orders_count > 0:
                    order = response['data'][0]
                    self.log(f"   First order: {order.get('vin', '')} - Status: {order.get('status', '')}")
                    if 'processState' in order:
                        self.log(f"   Process state included: {len(order['processState'])} steps")
                
                return True
            else:
                self.log("❌ Invalid orders response format")
                return False
        return False

    def test_customer_cabinet_order_details(self):
        """Test GET /api/customer-cabinet/:customerId/orders/:dealId"""
        self.log("\n=== TESTING CUSTOMER CABINET ORDER DETAILS ===")
        
        success, response = self.run_test(
            "Customer Cabinet Order Details",
            "GET",
            f"customer-cabinet/{self.test_customer_id}/orders/{self.test_deal_id}",
            200
        )
        
        if success:
            # Check required fields in order details response
            required_fields = ['deal', 'deposits', 'depositSummary', 'timeline', 'processState']
            
            if 'deal' in response:
                self.log("✅ Order details retrieved successfully")
                
                deal = response['deal']
                self.log(f"   Deal: {deal.get('vin', '')} - Status: {deal.get('status', '')}")
                self.log(f"   Price: ${deal.get('clientPrice', 0)}")
                
                # Check deposits
                deposits = response.get('deposits', [])
                self.log(f"   Deposits: {len(deposits)} found")
                
                # Check deposit summary
                deposit_summary = response.get('depositSummary', {})
                self.log(f"   Deposit Summary - Total: {deposit_summary.get('total', 0)}")
                self.log(f"   Deposit Summary - Amount: ${deposit_summary.get('totalAmount', 0)}")
                
                # Check timeline
                timeline = response.get('timeline', [])
                self.log(f"   Timeline: {len(timeline)} events")
                
                # Check process state
                process_state = response.get('processState', [])
                self.log(f"   Process State: {len(process_state)} steps")
                
                # Check what's next
                whats_next = response.get('whatsNext')
                if whats_next:
                    self.log(f"   What's Next: {whats_next.get('title', '')}")
                
                return True
            else:
                self.log("❌ Missing deal in order details response")
                return False
        return False

    def test_customer_cabinet_deposits(self):
        """Test GET /api/customer-cabinet/:customerId/deposits"""
        self.log("\n=== TESTING CUSTOMER CABINET DEPOSITS ===")
        
        success, response = self.run_test(
            "Customer Cabinet Deposits",
            "GET",
            f"customer-cabinet/{self.test_customer_id}/deposits",
            200
        )
        
        if success:
            if 'data' in response and 'summary' in response and 'meta' in response:
                deposits_count = len(response['data'])
                self.log(f"✅ Found {deposits_count} deposits")
                
                # Check summary
                summary = response['summary']
                self.log(f"   Summary - Total: {summary.get('total', 0)}")
                self.log(f"   Summary - Total Amount: ${summary.get('totalAmount', 0)}")
                self.log(f"   Summary - Confirmed: {summary.get('confirmed', 0)}")
                self.log(f"   Summary - Pending: {summary.get('pending', 0)}")
                
                # Check meta
                meta = response['meta']
                self.log(f"   Meta - Total: {meta.get('total', 0)}, Page: {meta.get('page', 1)}")
                
                # Check deposit structure if any deposits exist
                if deposits_count > 0:
                    deposit = response['data'][0]
                    self.log(f"   First deposit: ${deposit.get('amount', 0)} - Status: {deposit.get('status', '')}")
                    if 'dealInfo' in deposit and deposit['dealInfo']:
                        deal_info = deposit['dealInfo']
                        self.log(f"   Deal Info: {deal_info.get('vin', '')} - {deal_info.get('title', '')}")
                
                return True
            else:
                self.log("❌ Invalid deposits response format")
                return False
        return False

    def test_customer_cabinet_timeline(self):
        """Test GET /api/customer-cabinet/:customerId/timeline"""
        self.log("\n=== TESTING CUSTOMER CABINET TIMELINE ===")
        
        success, response = self.run_test(
            "Customer Cabinet Timeline",
            "GET",
            f"customer-cabinet/{self.test_customer_id}/timeline",
            200
        )
        
        if success:
            if 'data' in response and 'meta' in response:
                timeline_count = len(response['data'])
                self.log(f"✅ Found {timeline_count} timeline events")
                
                # Check meta
                meta = response['meta']
                self.log(f"   Meta - Total: {meta.get('total', 0)}, Page: {meta.get('page', 1)}")
                
                # Check timeline event structure
                if timeline_count > 0:
                    for i, event in enumerate(response['data'][:3]):  # Check first 3 events
                        if 'type' in event and 'createdAt' in event:
                            self.log(f"   Event {i+1}: {event.get('type', '')} - {event.get('title', '')}")
                            if 'description' in event:
                                self.log(f"     Description: {event['description'][:50]}...")
                        else:
                            self.log("❌ Invalid timeline event structure")
                            return False
                
                # Check grouped timeline if present
                if 'grouped' in response:
                    grouped = response['grouped']
                    self.log(f"   Grouped timeline: {len(grouped)} dates")
                
                return True
            else:
                self.log("❌ Invalid timeline response format")
                return False
        return False

    def test_customer_cabinet_profile(self):
        """Test GET /api/customer-cabinet/:customerId/profile"""
        self.log("\n=== TESTING CUSTOMER CABINET PROFILE ===")
        
        success, response = self.run_test(
            "Customer Cabinet Profile",
            "GET",
            f"customer-cabinet/{self.test_customer_id}/profile",
            200
        )
        
        if success:
            if 'customer' in response and 'stats' in response:
                self.log("✅ Profile retrieved successfully")
                
                # Check customer data
                customer = response['customer']
                self.log(f"   Customer: {customer.get('firstName', '')} {customer.get('lastName', '')}")
                self.log(f"   Email: {customer.get('email', '')}")
                self.log(f"   Phone: {customer.get('phone', '')}")
                
                # Check stats
                stats = response['stats']
                self.log(f"   Stats - Total Leads: {stats.get('totalLeads', 0)}")
                self.log(f"   Stats - Total Deals: {stats.get('totalDeals', 0)}")
                self.log(f"   Stats - Total Deposits: {stats.get('totalDeposits', 0)}")
                self.log(f"   Stats - Completed Deals: {stats.get('completedDeals', 0)}")
                
                if 'memberSince' in stats:
                    self.log(f"   Member since: {stats['memberSince']}")
                
                # Check manager info if present
                if 'manager' in response and response['manager']:
                    manager = response['manager']
                    self.log(f"   Manager: {manager.get('name', '')}")
                
                return True
            else:
                self.log("❌ Missing required fields in profile response")
                return False
        return False

    def test_auth_me(self):
        """Test authenticated user info"""
        self.log("\n=== TESTING AUTH ME ===")
        
        if not self.token:
            self.log("❌ No token available for auth test")
            return False
        
        success, response = self.run_test(
            "Get User Info",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            if 'email' in response or 'id' in response:
                self.log("✅ User info retrieved successfully")
                self.log(f"   Email: {response.get('email', 'N/A')}")
                self.log(f"   Role: {response.get('role', 'N/A')}")
                return True
            else:
                self.log("❌ Invalid user info response")
                return False
        return False

    def run_all_tests(self):
        """Run all Customer Cabinet backend tests"""
        self.log("🚀 Starting BIBI Cars CRM - Customer Cabinet Backend Testing")
        self.log(f"   Base URL: {self.base_url}")
        self.log(f"   Test Customer ID: {self.test_customer_id}")
        self.log(f"   Test Deal ID: {self.test_deal_id}")
        
        # Test sequence
        tests = [
            ("Admin Authentication", self.test_admin_login),
            ("Auth Me", self.test_auth_me),
            ("Customer Cabinet Dashboard", self.test_customer_cabinet_dashboard),
            ("Customer Cabinet Orders", self.test_customer_cabinet_orders),
            ("Customer Cabinet Order Details", self.test_customer_cabinet_order_details),
            ("Customer Cabinet Deposits", self.test_customer_cabinet_deposits),
            ("Customer Cabinet Timeline", self.test_customer_cabinet_timeline),
            ("Customer Cabinet Profile", self.test_customer_cabinet_profile),
        ]
        
        failed_tests = []
        
        for test_name, test_func in tests:
            try:
                if not test_func():
                    failed_tests.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {str(e)}")
                failed_tests.append(test_name)
        
        # Final results
        self.log(f"\n📊 FINAL RESULTS")
        self.log(f"   Tests run: {self.tests_run}")
        self.log(f"   Tests passed: {self.tests_passed}")
        self.log(f"   Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"   Success rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if failed_tests:
            self.log(f"\n❌ Failed tests: {', '.join(failed_tests)}")
            return False
        else:
            self.log("\n✅ All tests passed!")
            return True

def main():
    """Main test runner"""
    tester = CustomerCabinetAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())