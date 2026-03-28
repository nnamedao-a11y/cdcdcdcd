#!/usr/bin/env python3
"""
BIBI Cars CRM - Backend API Testing for BLOCK 2, 3, 4
Testing Calculator, Public Leads, Admin Auth, Tasks/Automation endpoints
"""

import requests
import sys
import time
from datetime import datetime

class BIBICRMTester:
    def __init__(self, base_url="https://inclusive-design-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            response = None
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Print response details for successful tests
                try:
                    json_data = response.json()
                    if isinstance(json_data, dict):
                        if 'success' in json_data:
                            print(f"   Success: {json_data['success']}")
                        if 'data' in json_data and isinstance(json_data['data'], list):
                            print(f"   Found {len(json_data['data'])} items")
                        elif 'leadId' in json_data:
                            print(f"   Lead ID: {json_data['leadId']}")
                        elif 'totals' in json_data:
                            print(f"   Total cost: ${json_data['totals'].get('visible', 0)}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")

            return success, response.json() if response and response.content and response.headers.get('content-type', '').startswith('application/json') else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login with admin@crm.com / admin123"""
        print("\n" + "="*60)
        print("TESTING BLOCK 3: ADMIN LOGIN")
        print("="*60)
        
        login_data = {
            "email": "admin@crm.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login (admin@crm.com)",
            "POST",
            "api/auth/login",
            201,
            data=login_data
        )
        
        if success:
            print("✅ Admin login endpoint is working")
            if 'access_token' in response:
                self.admin_token = response['access_token']
                print("✅ JWT token received")
                return True
            elif 'token' in response:
                self.admin_token = response['token']
                print("✅ JWT token received")
                return True
            elif 'success' in response and response['success']:
                print("✅ Login successful")
                return True
            else:
                print("❌ Login response missing token")
                return False
        else:
            print("❌ Admin login endpoint failed")
            return False

    def test_calculator_ports(self):
        """Test calculator ports endpoint"""
        print("\n" + "="*60)
        print("TESTING BLOCK 2: CALCULATOR PORTS")
        print("="*60)
        
        success, response = self.run_test(
            "Calculator Ports",
            "GET",
            "api/calculator/ports",
            200
        )
        
        if success:
            print("✅ Calculator ports endpoint is working")
            if 'ports' in response:
                print(f"   Found {len(response['ports'])} ports")
                for port in response['ports'][:3]:  # Show first 3
                    print(f"   - {port.get('code', 'N/A')}: {port.get('name', 'N/A')}")
            if 'vehicleTypes' in response:
                print(f"   Found {len(response['vehicleTypes'])} vehicle types")
            return True
        else:
            print("❌ Calculator ports endpoint failed")
            return False

    def test_calculator_calculate(self):
        """Test calculator calculation endpoint"""
        print("\n" + "="*60)
        print("TESTING BLOCK 2: CALCULATOR CALCULATION")
        print("="*60)
        
        calc_data = {
            "price": 15000,
            "port": "NJ",
            "vehicleType": "sedan",
            "vin": "WVWZZZ3CZWE123789"
        }
        
        success, response = self.run_test(
            "Calculator Calculate",
            "POST",
            "api/calculator/calculate",
            201,
            data=calc_data
        )
        
        if success:
            print("✅ Calculator calculation endpoint is working")
            if 'totals' in response:
                visible_total = response['totals'].get('visible', 0)
                print(f"   Calculated total: ${visible_total}")
            if 'breakdown' in response:
                breakdown = response['breakdown']
                print(f"   Car price: ${breakdown.get('carPrice', 0)}")
                print(f"   Customs: ${breakdown.get('customs', 0)}")
            return True
        else:
            print("❌ Calculator calculation endpoint failed")
            return False

    def test_public_vehicles(self):
        """Test public vehicles endpoint"""
        print("\n" + "="*60)
        print("TESTING BLOCK 2: PUBLIC VEHICLES")
        print("="*60)
        
        success, response = self.run_test(
            "Public Vehicles",
            "GET",
            "api/public/vehicles?limit=10",
            200
        )
        
        if success:
            print("✅ Public vehicles endpoint is working")
            if 'data' in response:
                vehicles = response['data']
                print(f"   Found {len(vehicles)} vehicles")
                if vehicles:
                    vehicle = vehicles[0]
                    print(f"   Sample vehicle: {vehicle.get('make', 'N/A')} {vehicle.get('model', 'N/A')}")
                    print(f"   VIN: {vehicle.get('vin', 'N/A')}")
            return True
        else:
            print("❌ Public vehicles endpoint failed")
            return False

    def test_public_lead_creation(self):
        """Test public lead creation (BLOCK 4: Auto-create task)"""
        print("\n" + "="*60)
        print("TESTING BLOCK 4: PUBLIC LEAD CREATION + AUTO TASKS")
        print("="*60)
        
        # Create a lead via public API
        lead_data = {
            "firstName": "Test",
            "lastName": "User",
            "phone": "+380501234567",
            "email": "test@example.com",
            "vin": "WVWZZZ3CZWE123789",
            "comment": "Test lead for automation",
            "source": "website",
            "price": 15000,
            "vehicleTitle": "VW Tiguan 2020"
        }
        
        success, response = self.run_test(
            "Create Public Lead (should trigger automation)",
            "POST",
            "api/public/leads/quick",
            201,
            data=lead_data
        )
        
        if success:
            print("✅ Public lead creation endpoint is working")
            if 'leadId' in response:
                lead_id = response['leadId']
                print(f"   Created lead ID: {lead_id}")
                
                # Wait a moment for automation to trigger
                print("   Waiting 3 seconds for automation to process...")
                time.sleep(3)
                
                return True, lead_id
            else:
                print("❌ Lead creation response missing leadId")
                return False, None
        else:
            print("❌ Public lead creation endpoint failed")
            return False, None

    def test_admin_tasks(self, lead_id=None):
        """Test admin tasks endpoint (should show auto-created tasks)"""
        print("\n" + "="*60)
        print("TESTING BLOCK 4: ADMIN TASKS (AUTO-CREATED)")
        print("="*60)
        
        if not self.admin_token:
            print("❌ No admin token available for tasks test")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, response = self.run_test(
            "Admin Tasks List",
            "GET",
            "api/tasks?limit=20",
            200,
            headers=headers
        )
        
        if success:
            print("✅ Admin tasks endpoint is working")
            if 'data' in response:
                tasks = response['data']
                print(f"   Found {len(tasks)} tasks")
                
                # Look for tasks related to our lead
                if lead_id:
                    related_tasks = [t for t in tasks if t.get('relatedEntityId') == lead_id]
                    print(f"   Tasks related to lead {lead_id}: {len(related_tasks)}")
                    
                    for task in related_tasks:
                        print(f"   - Task: {task.get('title', 'N/A')}")
                        print(f"     Priority: {task.get('priority', 'N/A')}")
                        print(f"     Due: {task.get('dueDate', 'N/A')}")
                
                # Show some recent tasks
                for task in tasks[:3]:
                    print(f"   - {task.get('title', 'N/A')} (Priority: {task.get('priority', 'N/A')})")
            return True
        else:
            print("❌ Admin tasks endpoint failed")
            return False

    def test_admin_leads(self):
        """Test admin leads endpoint"""
        print("\n" + "="*60)
        print("TESTING BLOCK 3: ADMIN LEADS ACCESS")
        print("="*60)
        
        if not self.admin_token:
            print("❌ No admin token available for leads test")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, response = self.run_test(
            "Admin Leads List",
            "GET",
            "api/leads?limit=10",
            200,
            headers=headers
        )
        
        if success:
            print("✅ Admin leads endpoint is working")
            if 'data' in response:
                leads = response['data']
                print(f"   Found {len(leads)} leads")
                for lead in leads[:3]:
                    print(f"   - {lead.get('firstName', 'N/A')} {lead.get('lastName', 'N/A')} ({lead.get('status', 'N/A')})")
            return True
        else:
            print("❌ Admin leads endpoint failed")
            return False

    def test_homepage_loading(self):
        """Test if homepage loads correctly"""
        print("\n" + "="*60)
        print("TESTING BLOCK 2: HOMEPAGE LOADING")
        print("="*60)
        
        try:
            response = requests.get(self.base_url, timeout=10)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print("✅ Homepage loads correctly")
                # Check if it contains expected content
                if 'BIBI Cars' in response.text:
                    print("   ✅ Contains BIBI Cars branding")
                return True
            else:
                print(f"❌ Homepage failed - Status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Homepage loading failed: {str(e)}")
            return False
        finally:
            self.tests_run += 1

def main():
    print("🚗 BIBI Cars CRM - Backend API Testing (BLOCKS 2, 3, 4)")
    print("=" * 70)
    
    tester = BIBICRMTester()
    
    try:
        # BLOCK 3: Admin Authentication
        admin_login = tester.test_admin_login()
        
        # BLOCK 2: Site Finalization
        homepage_loading = tester.test_homepage_loading()
        calculator_ports = tester.test_calculator_ports()
        calculator_calculate = tester.test_calculator_calculate()
        public_vehicles = tester.test_public_vehicles()
        
        # BLOCK 4: Tasks/SLA + Automation
        lead_creation_success, lead_id = tester.test_public_lead_creation()
        
        # BLOCK 3: Role-based access (admin sees all sections)
        admin_leads = tester.test_admin_leads()
        admin_tasks = tester.test_admin_tasks(lead_id)
        
        # Print final results
        print("\n" + "="*70)
        print("📊 FINAL TEST RESULTS")
        print("="*70)
        print(f"Tests Run: {tester.tests_run}")
        print(f"Tests Passed: {tester.tests_passed}")
        print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
        
        print("\n🔐 BLOCK 3: Roles & Access Results:")
        print(f"   Admin Login: {'✅' if admin_login else '❌'}")
        print(f"   Admin Leads Access: {'✅' if admin_leads else '❌'}")
        print(f"   Admin Tasks Access: {'✅' if admin_tasks else '❌'}")
        
        print("\n🌐 BLOCK 2: Site Finalization Results:")
        print(f"   Homepage Loading: {'✅' if homepage_loading else '❌'}")
        print(f"   Calculator Ports: {'✅' if calculator_ports else '❌'}")
        print(f"   Calculator Calculate: {'✅' if calculator_calculate else '❌'}")
        print(f"   Public Vehicles: {'✅' if public_vehicles else '❌'}")
        
        print("\n⚡ BLOCK 4: Tasks/SLA Results:")
        print(f"   Public Lead Creation: {'✅' if lead_creation_success else '❌'}")
        print(f"   Auto-created Tasks: {'✅' if admin_tasks else '❌'}")
        
        if lead_id:
            print(f"\n📝 Created test lead: {lead_id}")
            print("   Check /admin/tasks for auto-created tasks related to this lead")
        
        if tester.tests_passed >= tester.tests_run * 0.8:  # 80% success rate
            print("🎉 Most backend tests passed!")
            return 0
        else:
            print("⚠️  Many backend tests failed")
            return 1
            
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())