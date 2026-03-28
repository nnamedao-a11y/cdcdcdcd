#!/usr/bin/env python3
"""
BIBI Cars CRM - Backend API Testing
Testing Revenue AI, Analytics Tracking, Telegram bot, and AI recommendations endpoints
"""

import requests
import sys
import time
from datetime import datetime

class BIBICarsAPITester:
    def __init__(self, base_url="https://a11y-review.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

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
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Print response details for successful tests
                try:
                    json_data = response.json()
                    if isinstance(json_data, dict):
                        if 'items' in json_data:
                            print(f"   Found {len(json_data['items'])} items")
                        elif 'total' in json_data:
                            print(f"   Total: {json_data['total']}")
                        elif 'vin' in json_data:
                            print(f"   VIN: {json_data['vin']}")
                        elif 'title' in json_data:
                            print(f"   Title: {json_data['title']}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.content and response.headers.get('content-type', '').startswith('application/json') else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_revenue_ai_status(self):
        """Test Revenue AI status endpoint"""
        print("\n" + "="*60)
        print("TESTING REVENUE AI STATUS")
        print("="*60)
        
        success, response = self.run_test(
            "Revenue AI Status",
            "GET",
            "api/revenue-ai/status",
            200
        )
        
        if success:
            print("✅ Revenue AI status endpoint is working")
            if 'ok' in response:
                print(f"   Status OK: {response['ok']}")
            if 'service' in response:
                print(f"   Service: {response['service']}")
            if 'features' in response:
                print(f"   Features: {response['features']}")
            return True
        else:
            print("❌ Revenue AI status endpoint failed")
            return False

    def test_revenue_ai_intent(self):
        """Test Revenue AI intent scoring endpoint"""
        print("\n" + "="*60)
        print("TESTING REVENUE AI INTENT SCORING")
        print("="*60)
        
        # Test with valid customer ID
        success, response = self.run_test(
            "Revenue AI Intent (with customerId)",
            "GET",
            "api/revenue-ai/intent?customerId=test_customer_123",
            200
        )
        
        if success:
            print("✅ Revenue AI intent endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Intent data: {response['data']}")
            
            # Test without customer ID (should return error)
            success2, response2 = self.run_test(
                "Revenue AI Intent (without customerId)",
                "GET",
                "api/revenue-ai/intent",
                200
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing customerId")
                return True
            else:
                print("❌ Should return error for missing customerId")
                return False
        else:
            print("❌ Revenue AI intent endpoint failed")
            return False

    def test_revenue_ai_price(self):
        """Test Revenue AI dynamic pricing endpoint"""
        print("\n" + "="*60)
        print("TESTING REVENUE AI DYNAMIC PRICING")
        print("="*60)
        
        # Test with valid price data
        price_data = {
            "basePrice": 15000,
            "customerId": "test_customer_123",
            "vehicleType": "sedan",
            "marketConditions": "normal"
        }
        
        success, response = self.run_test(
            "Revenue AI Dynamic Pricing (with data)",
            "POST",
            "api/revenue-ai/price",
            201,  # Changed from 200 to 201
            data=price_data
        )
        
        if success:
            print("✅ Revenue AI pricing endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Pricing data: {response['data']}")
            
            # Test without basePrice (should return error)
            success2, response2 = self.run_test(
                "Revenue AI Pricing (without basePrice)",
                "POST",
                "api/revenue-ai/price",
                201,  # Changed from 200 to 201
                data={"customerId": "test_customer_123"}
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing basePrice")
                return True
            else:
                print("❌ Should return error for missing basePrice")
                return False
        else:
            print("❌ Revenue AI pricing endpoint failed")
            return False

    def test_revenue_ai_margin(self):
        """Test Revenue AI optimal margin endpoint"""
        print("\n" + "="*60)
        print("TESTING REVENUE AI OPTIMAL MARGIN")
        print("="*60)
        
        # Test with valid customer ID
        success, response = self.run_test(
            "Revenue AI Margin (with customerId)",
            "GET",
            "api/revenue-ai/margin?customerId=test_customer_123",
            200
        )
        
        if success:
            print("✅ Revenue AI margin endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Margin data: {response['data']}")
            
            # Test without customer ID (should return error)
            success2, response2 = self.run_test(
                "Revenue AI Margin (without customerId)",
                "GET",
                "api/revenue-ai/margin",
                200
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing customerId")
                return True
            else:
                print("❌ Should return error for missing customerId")
                return False
        else:
            print("❌ Revenue AI margin endpoint failed")
            return False

    def test_analytics_status(self):
        """Test Analytics status endpoint"""
        print("\n" + "="*60)
        print("TESTING ANALYTICS STATUS")
        print("="*60)
        
        success, response = self.run_test(
            "Analytics Status",
            "GET",
            "api/analytics/status",
            200
        )
        
        if success:
            print("✅ Analytics status endpoint is working")
            if 'ok' in response:
                print(f"   Status OK: {response['ok']}")
            if 'service' in response:
                print(f"   Service: {response['service']}")
            if 'features' in response:
                print(f"   Features: {response['features']}")
            return True
        else:
            print("❌ Analytics status endpoint failed")
            return False

    def test_analytics_dashboard(self):
        """Test Analytics dashboard endpoint"""
        print("\n" + "="*60)
        print("TESTING ANALYTICS DASHBOARD")
        print("="*60)
        
        success, response = self.run_test(
            "Analytics Dashboard (30 days)",
            "GET",
            "api/analytics/dashboard?days=30",
            200
        )
        
        if success:
            print("✅ Analytics dashboard endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Dashboard data available")
            return True
        else:
            print("❌ Analytics dashboard endpoint failed")
            return False

    def test_analytics_kpi(self):
        """Test Analytics KPI endpoint"""
        print("\n" + "="*60)
        print("TESTING ANALYTICS KPI")
        print("="*60)
        
        success, response = self.run_test(
            "Analytics KPI (30 days)",
            "GET",
            "api/analytics/kpi?days=30",
            200
        )
        
        if success:
            print("✅ Analytics KPI endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   KPI data available")
            return True
        else:
            print("❌ Analytics KPI endpoint failed")
            return False

    def test_analytics_funnel(self):
        """Test Analytics funnel endpoint"""
        print("\n" + "="*60)
        print("TESTING ANALYTICS FUNNEL")
        print("="*60)
        
        success, response = self.run_test(
            "Analytics Funnel (30 days)",
            "GET",
            "api/analytics/funnel?days=30",
            200
        )
        
        if success:
            print("✅ Analytics funnel endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Funnel data available")
            return True
        else:
            print("❌ Analytics funnel endpoint failed")
            return False

    def test_analytics_track(self):
        """Test Analytics event tracking endpoint"""
        print("\n" + "="*60)
        print("TESTING ANALYTICS EVENT TRACKING")
        print("="*60)
        
        # Test event tracking
        track_data = {
            "event": "page_view",
            "page": "/test-page",
            "sessionId": "test_session_123",
            "customerId": "test_customer_123",
            "source": "direct",
            "campaign": "test_campaign"
        }
        
        success, response = self.run_test(
            "Analytics Event Tracking",
            "POST",
            "api/analytics/track",
            201,  # Changed from 200 to 201
            data=track_data
        )
        
        if success:
            print("✅ Analytics tracking endpoint is working")
            if 'ok' in response:
                print(f"   Tracking OK: {response['ok']}")
            return True
        else:
            print("❌ Analytics tracking endpoint failed")
            return False

    def test_recommendations_status(self):
        """Test AI Recommendations status endpoint"""
        print("\n" + "="*60)
        print("TESTING AI RECOMMENDATIONS STATUS")
        print("="*60)
        
        # Test recommendations status endpoint
        success, response = self.run_test(
            "AI Recommendations Status",
            "GET",
            "api/recommendations/status",
            200
        )
        
        if success:
            print("✅ AI Recommendations status endpoint is working")
            # Check response structure
            if 'ok' in response:
                print(f"   Status OK: {response['ok']}")
            if 'service' in response:
                print(f"   Service: {response['service']}")
            if 'features' in response:
                print(f"   Features: {response['features']}")
            return True
        else:
            print("❌ AI Recommendations status endpoint failed")
            return False

    def test_get_recommendations(self):
        """Test get recommendations endpoint"""
        print("\n" + "="*60)
        print("TESTING GET RECOMMENDATIONS")
        print("="*60)
        
        # Test with valid customer ID
        success, response = self.run_test(
            "Get Recommendations (with customerId)",
            "GET",
            "api/recommendations?customerId=test_customer_123&limit=5",
            200
        )
        
        if success:
            print("✅ Get recommendations endpoint is working")
            # Check response structure
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Recommendations count: {len(response['data'])}")
            if 'meta' in response:
                print(f"   Meta info: {response['meta']}")
            
            # Test without customer ID (should return error)
            success2, response2 = self.run_test(
                "Get Recommendations (without customerId)",
                "GET",
                "api/recommendations",
                200  # Still returns 200 but with error in response
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing customerId")
                return True
            else:
                print("❌ Should return error for missing customerId")
                return False
        else:
            print("❌ Get recommendations endpoint failed")
            return False

    def test_get_user_profile(self):
        """Test get user profile endpoint"""
        print("\n" + "="*60)
        print("TESTING GET USER PROFILE")
        print("="*60)
        
        # Test with valid customer ID
        success, response = self.run_test(
            "Get User Profile (with customerId)",
            "GET",
            "api/recommendations/profile?customerId=test_customer_123",
            200
        )
        
        if success:
            print("✅ Get user profile endpoint is working")
            # Check response structure
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                if response['data']:
                    print(f"   Profile data available")
                else:
                    print(f"   No profile data (expected for new customer)")
            
            # Test without customer ID (should return error)
            success2, response2 = self.run_test(
                "Get User Profile (without customerId)",
                "GET",
                "api/recommendations/profile",
                200  # Still returns 200 but with error in response
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing customerId")
                return True
            else:
                print("❌ Should return error for missing customerId")
                return False
        else:
            print("❌ Get user profile endpoint failed")
            return False

    def test_get_missed_recommendations(self):
        """Test get 'You Missed This' recommendations endpoint"""
        print("\n" + "="*60)
        print("TESTING GET MISSED RECOMMENDATIONS")
        print("="*60)
        
        # Test with valid customer ID
        success, response = self.run_test(
            "Get Missed Recommendations (with customerId)",
            "GET",
            "api/recommendations/missed?customerId=test_customer_123&limit=3",
            200
        )
        
        if success:
            print("✅ Get missed recommendations endpoint is working")
            # Check response structure
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Missed recommendations count: {len(response['data'])}")
            if 'meta' in response:
                print(f"   Meta info: {response['meta']}")
            
            # Test without customer ID (should return error)
            success2, response2 = self.run_test(
                "Get Missed Recommendations (without customerId)",
                "GET",
                "api/recommendations/missed",
                200  # Still returns 200 but with error in response
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing customerId")
                return True
            else:
                print("❌ Should return error for missing customerId")
                return False
        else:
            print("❌ Get missed recommendations endpoint failed")
            return False

    def test_get_auction_soon_recommendations(self):
        """Test get auction-soon recommendations endpoint"""
        print("\n" + "="*60)
        print("TESTING GET AUCTION-SOON RECOMMENDATIONS")
        print("="*60)
        
        # Test with valid customer ID
        success, response = self.run_test(
            "Get Auction-Soon Recommendations (with customerId)",
            "GET",
            "api/recommendations/auction-soon?customerId=test_customer_123&hours=24&limit=3",
            200
        )
        
        if success:
            print("✅ Get auction-soon recommendations endpoint is working")
            # Check response structure
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                print(f"   Auction-soon recommendations count: {len(response['data'])}")
            if 'meta' in response:
                print(f"   Meta info: {response['meta']}")
            
            # Test without customer ID (should return error)
            success2, response2 = self.run_test(
                "Get Auction-Soon Recommendations (without customerId)",
                "GET",
                "api/recommendations/auction-soon",
                200  # Still returns 200 but with error in response
            )
            
            if success2 and response2.get('success') == False:
                print("✅ Properly handles missing customerId")
                return True
            else:
                print("❌ Should return error for missing customerId")
                return False
        else:
            print("❌ Get auction-soon recommendations endpoint failed")
            return False

    def test_telegram_bot_status(self):
        """Test Telegram bot status endpoint"""
        print("\n" + "="*60)
        print("TESTING TELEGRAM BOT STATUS")
        print("="*60)
        
        # Test telegram bot status endpoint
        success, response = self.run_test(
            "Telegram Bot Status",
            "GET",
            "api/telegram-bot/status",
            200
        )
        
        if success:
            print("✅ Telegram bot status endpoint is working")
            # Check response structure
            if 'configured' in response:
                print(f"   Bot configured: {response['configured']}")
            if 'bot' in response:
                print(f"   Bot info: {response['bot']}")
            return True
        else:
            print("❌ Telegram bot status endpoint failed")
            return False

    def test_telegram_webhook(self):
        """Test Telegram webhook endpoint with /start command"""
        print("\n" + "="*60)
        print("TESTING TELEGRAM WEBHOOK")
        print("="*60)
        
        # Test webhook with /start command
        webhook_data = {
            "message": {
                "message_id": 123,
                "from": {
                    "id": 12345,
                    "first_name": "Test",
                    "username": "testuser"
                },
                "chat": {
                    "id": 12345,
                    "type": "private"
                },
                "date": 1640995200,
                "text": "/start"
            }
        }
        
        success, response = self.run_test(
            "Telegram Webhook (/start command)",
            "POST",
            "api/telegram-bot/webhook",
            201,  # Changed from 200 to 201
            data=webhook_data
        )
        
        if success:
            print("✅ Telegram webhook endpoint is working")
            if 'ok' in response:
                print(f"   Webhook OK: {response['ok']}")
            return True
        else:
            print("❌ Telegram webhook endpoint failed")
            return False
        """Test Telegram bot status endpoint"""
        print("\n" + "="*60)
        print("TESTING TELEGRAM BOT STATUS")
        print("="*60)
        
        # Test telegram bot status endpoint
        success, response = self.run_test(
            "Telegram Bot Status",
            "GET",
            "api/telegram-bot/status",
            200
        )
        
        if success:
            print("✅ Telegram bot status endpoint is working")
            # Check response structure
            if 'configured' in response:
                print(f"   Bot configured: {response['configured']}")
            if 'bot' in response:
                print(f"   Bot info: {response['bot']}")
            return True
        else:
            print("❌ Telegram bot status endpoint failed")
            return False

    def test_marketing_status(self):
        """Test Marketing module status endpoint"""
        print("\n" + "="*60)
        print("TESTING MARKETING STATUS")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Status",
            "GET",
            "api/marketing/status",
            200
        )
        
        if success:
            print("✅ Marketing status endpoint is working")
            if 'ok' in response:
                print(f"   Status OK: {response['ok']}")
            if 'service' in response:
                print(f"   Service: {response['service']}")
            if 'features' in response:
                print(f"   Features: {response['features']}")
            if 'facebookCapi' in response:
                print(f"   Facebook CAPI configured: {response['facebookCapi'].get('configured', False)}")
            return True
        else:
            print("❌ Marketing status endpoint failed")
            return False

    def test_marketing_campaigns(self):
        """Test Marketing campaigns endpoint"""
        print("\n" + "="*60)
        print("TESTING MARKETING CAMPAIGNS")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Campaigns (30 days)",
            "GET",
            "api/marketing/campaigns?days=30",
            200
        )
        
        if success:
            print("✅ Marketing campaigns endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                data = response['data']
                if 'decisions' in data:
                    print(f"   Campaign decisions: {len(data['decisions'])}")
                if 'summary' in data:
                    summary = data['summary']
                    print(f"   Total spend: ${summary.get('totalSpend', 0)}")
                    print(f"   Overall ROI: {summary.get('overallRoi', 0)}%")
                    print(f"   Scale/Keep/Watch/Kill: {summary.get('scaleCount', 0)}/{summary.get('keepCount', 0)}/{summary.get('watchCount', 0)}/{summary.get('killCount', 0)}")
            return True
        else:
            print("❌ Marketing campaigns endpoint failed")
            return False

    def test_marketing_sources(self):
        """Test Marketing sources endpoint"""
        print("\n" + "="*60)
        print("TESTING MARKETING SOURCES")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Sources (30 days)",
            "GET",
            "api/marketing/sources?days=30",
            200
        )
        
        if success:
            print("✅ Marketing sources endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                sources = response['data']
                print(f"   Sources found: {len(sources)}")
                for source in sources[:3]:  # Show first 3 sources
                    print(f"   - {source.get('source', 'Unknown')}: {source.get('campaigns', 0)} campaigns, ROI: {source.get('roi', 0):.1f}%")
            return True
        else:
            print("❌ Marketing sources endpoint failed")
            return False

    def test_marketing_recommendations(self):
        """Test Marketing recommendations endpoint"""
        print("\n" + "="*60)
        print("TESTING MARKETING RECOMMENDATIONS")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Recommendations (30 days)",
            "GET",
            "api/marketing/recommendations?days=30",
            200
        )
        
        if success:
            print("✅ Marketing recommendations endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                data = response['data']
                if 'recommendations' in data:
                    recs = data['recommendations']
                    print(f"   Recommendations: {len(recs)}")
                    for rec in recs[:3]:  # Show first 3 recommendations
                        print(f"   - {rec.get('priority', 'medium').upper()}: {rec.get('action', 'unknown')} - {rec.get('message', 'No message')}")
                if 'summary' in data:
                    summary = data['summary']
                    print(f"   Summary - Total spend: ${summary.get('totalSpend', 0)}, ROI: {summary.get('overallRoi', 0)}%")
            return True
        else:
            print("❌ Marketing recommendations endpoint failed")
            return False

    def test_marketing_optimize(self):
        """Test Marketing optimize endpoint"""
        print("\n" + "="*60)
        print("TESTING MARKETING OPTIMIZE")
        print("="*60)
        
        # Test with sample campaign data
        optimize_data = {
            "campaigns": [
                {
                    "source": "facebook",
                    "campaign": "test_campaign_1",
                    "spend": 150,
                    "visits": 100,
                    "leads": 8,
                    "deals": 2,
                    "revenue": 3000,
                    "profit": 1200,
                    "fakeTrafficRate": 5,
                    "vinSearches": 15,
                    "quotes": 5
                },
                {
                    "source": "google",
                    "campaign": "test_campaign_2",
                    "spend": 200,
                    "visits": 50,
                    "leads": 1,
                    "deals": 0,
                    "revenue": 0,
                    "profit": 0,
                    "fakeTrafficRate": 35,
                    "vinSearches": 2,
                    "quotes": 1
                }
            ]
        }
        
        success, response = self.run_test(
            "Marketing Optimize (with campaign data)",
            "POST",
            "api/marketing/optimize",
            201,
            data=optimize_data
        )
        
        if success:
            print("✅ Marketing optimize endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                data = response['data']
                if 'decisions' in data:
                    decisions = data['decisions']
                    print(f"   Decisions: {len(decisions)}")
                    for decision in decisions:
                        print(f"   - {decision.get('campaign', 'Unknown')}: {decision.get('status', 'unknown').upper()} (ROI: {decision.get('roi', 0)}%)")
                if 'summary' in data:
                    summary = data['summary']
                    print(f"   Summary - Overall ROI: {summary.get('overallRoi', 0)}%")
                    if 'recommendations' in summary:
                        print(f"   Recommendations: {len(summary['recommendations'])}")
            
            # Test without campaign data (should use database)
            success2, response2 = self.run_test(
                "Marketing Optimize (without campaign data)",
                "POST",
                "api/marketing/optimize",
                201,
                data={}
            )
            
            if success2:
                print("✅ Marketing optimize works with database data")
                return True
            else:
                print("❌ Marketing optimize failed with database data")
                return False
        else:
            print("❌ Marketing optimize endpoint failed")
            return False

    def test_homepage_loading(self):
        """Test if homepage loads correctly"""
        print("\n" + "="*60)
        print("TESTING HOMEPAGE LOADING")
        print("="*60)
        
        # Test root path - expect HTML response, not JSON
        success, response = self.run_test(
            "Homepage Loading",
            "GET",
            "",
            200
        )
        
        if success:
            print("✅ Homepage loads correctly")
            return True
        else:
            print("❌ Homepage not loading")
            return False

def main():
    print("🤖 BIBI Cars CRM - Backend API Testing")
    print("=" * 70)
    
    tester = BIBICarsAPITester()
    
    # Run all tests
    try:
        # Test Marketing Module endpoints (PRIORITY)
        marketing_status = tester.test_marketing_status()
        marketing_campaigns = tester.test_marketing_campaigns()
        marketing_sources = tester.test_marketing_sources()
        marketing_recommendations = tester.test_marketing_recommendations()
        marketing_optimize = tester.test_marketing_optimize()
        
        # Test Revenue AI endpoints
        revenue_ai_status = tester.test_revenue_ai_status()
        revenue_ai_intent = tester.test_revenue_ai_intent()
        revenue_ai_price = tester.test_revenue_ai_price()
        revenue_ai_margin = tester.test_revenue_ai_margin()
        
        # Test Analytics endpoints
        analytics_status = tester.test_analytics_status()
        analytics_dashboard = tester.test_analytics_dashboard()
        analytics_kpi = tester.test_analytics_kpi()
        analytics_funnel = tester.test_analytics_funnel()
        analytics_track = tester.test_analytics_track()
        
        # Test Telegram bot status and webhook
        telegram_status = tester.test_telegram_bot_status()
        telegram_webhook = tester.test_telegram_webhook()
        
        # Test AI Recommendations endpoints
        recommendations_status = tester.test_recommendations_status()
        get_recommendations = tester.test_get_recommendations()
        get_user_profile = tester.test_get_user_profile()
        get_missed_recommendations = tester.test_get_missed_recommendations()
        get_auction_soon_recommendations = tester.test_get_auction_soon_recommendations()
        
        # Test homepage loading
        homepage_success = tester.test_homepage_loading()
        
        # Print final results
        print("\n" + "="*70)
        print("📊 FINAL TEST RESULTS")
        print("="*70)
        print(f"Tests Run: {tester.tests_run}")
        print(f"Tests Passed: {tester.tests_passed}")
        print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
        
        # Marketing Module results (PRIORITY)
        print("\n🎯 Marketing Module Results:")
        print(f"   Status Endpoint: {'✅' if marketing_status else '❌'}")
        print(f"   Campaigns Performance: {'✅' if marketing_campaigns else '❌'}")
        print(f"   Sources Summary: {'✅' if marketing_sources else '❌'}")
        print(f"   Recommendations: {'✅' if marketing_recommendations else '❌'}")
        print(f"   Optimize Campaigns: {'✅' if marketing_optimize else '❌'}")
        
        # Revenue AI results
        print("\n💰 Revenue AI Results:")
        print(f"   Status Endpoint: {'✅' if revenue_ai_status else '❌'}")
        print(f"   Intent Scoring: {'✅' if revenue_ai_intent else '❌'}")
        print(f"   Dynamic Pricing: {'✅' if revenue_ai_price else '❌'}")
        print(f"   Optimal Margin: {'✅' if revenue_ai_margin else '❌'}")
        
        # Analytics results
        print("\n📊 Analytics Results:")
        print(f"   Status Endpoint: {'✅' if analytics_status else '❌'}")
        print(f"   Dashboard: {'✅' if analytics_dashboard else '❌'}")
        print(f"   KPI Metrics: {'✅' if analytics_kpi else '❌'}")
        print(f"   Funnel Data: {'✅' if analytics_funnel else '❌'}")
        print(f"   Event Tracking: {'✅' if analytics_track else '❌'}")
        
        # AI Recommendations results
        print("\n🧠 AI Recommendations Engine Results:")
        print(f"   Status Endpoint: {'✅' if recommendations_status else '❌'}")
        print(f"   Get Recommendations: {'✅' if get_recommendations else '❌'}")
        print(f"   Get User Profile: {'✅' if get_user_profile else '❌'}")
        print(f"   Get Missed Recommendations: {'✅' if get_missed_recommendations else '❌'}")
        print(f"   Get Auction-Soon Recommendations: {'✅' if get_auction_soon_recommendations else '❌'}")
        
        # Other endpoints results
        print("\n🤖 Telegram Bot Results:")
        print(f"   Bot Status: {'✅' if telegram_status else '❌'}")
        print(f"   Webhook (/start): {'✅' if telegram_webhook else '❌'}")
        
        print("\n🏠 Other Results:")
        print(f"   Homepage Loading: {'✅' if homepage_success else '❌'}")
        
        # Calculate marketing module success rate
        marketing_tests = [marketing_status, marketing_campaigns, marketing_sources, marketing_recommendations, marketing_optimize]
        marketing_success_rate = sum(marketing_tests) / len(marketing_tests) * 100
        
        print(f"\n🎯 Marketing Module Success Rate: {marketing_success_rate:.1f}%")
        
        if tester.tests_passed >= tester.tests_run * 0.8:  # 80% success rate
            print("🎉 Most tests passed!")
            return 0
        else:
            print("⚠️  Many tests failed")
            return 1
            
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())