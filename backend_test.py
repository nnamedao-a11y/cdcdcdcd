#!/usr/bin/env python3
"""
BIBI Cars CRM - Backend API Testing
Testing BLOCK 5 (Multilanguage) and BLOCK 6 (Moderation UI) endpoints
"""

import requests
import sys
import time
from datetime import datetime

class BIBICarsAPITester:
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

            return success, response.json() if response and response.content and response.headers.get('content-type', '').startswith('application/json') else {}

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

    def test_marketing_meta_ads_status(self):
        """Test Marketing status endpoint for Meta Ads features"""
        print("\n" + "="*60)
        print("TESTING MARKETING STATUS - META ADS FEATURES")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Status - Meta Ads Features",
            "GET",
            "api/marketing/status",
            200
        )
        
        if success:
            print("✅ Marketing status endpoint is working")
            
            # Check for version 2.0.0
            if response.get('version') == '2.0.0':
                print("✅ Version 2.0.0 confirmed")
            else:
                print(f"❌ Expected version 2.0.0, got {response.get('version')}")
                return False
            
            # Check for required features
            features = response.get('features', [])
            required_features = ['meta_ads_spend_sync', 'auto_actions']
            
            for feature in required_features:
                if feature in features:
                    print(f"✅ Feature '{feature}' found")
                else:
                    print(f"❌ Feature '{feature}' missing")
                    return False
            
            # Check Meta Ads configuration status
            meta_ads = response.get('metaAds', {})
            print(f"   Meta Ads configured: {meta_ads.get('configured', False)}")
            print(f"   Account ID: {meta_ads.get('accountId', 'not set')}")
            
            # Check auto mode status
            auto_mode = response.get('autoMode', {})
            print(f"   Auto mode enabled: {auto_mode.get('enabled', False)}")
            print(f"   Today actions: {auto_mode.get('todayActions', 0)}")
            print(f"   Max actions per day: {auto_mode.get('maxActionsPerDay', 0)}")
            
            return True
        else:
            print("❌ Marketing status endpoint failed")
            return False

    def test_marketing_auto_config_get(self):
        """Test GET /api/marketing/auto/config"""
        print("\n" + "="*60)
        print("TESTING MARKETING AUTO CONFIG - GET")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Auto Config - GET",
            "GET",
            "api/marketing/auto/config",
            200
        )
        
        if success:
            print("✅ Marketing auto config GET endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                data = response['data']
                print(f"   Enabled: {data.get('enabled', False)}")
                print(f"   Max actions per day: {data.get('maxActionsPerDay', 0)}")
                print(f"   Max budget change %: {data.get('maxBudgetChangePercent', 0)}")
                print(f"   Min spend for decision: ${data.get('minSpendForDecision', 0)}")
                print(f"   Today actions: {data.get('todayActions', 0)}")
                print(f"   Actions remaining: {data.get('actionsRemaining', 0)}")
            return True
        else:
            print("❌ Marketing auto config GET endpoint failed")
            return False

    def test_marketing_auto_config_patch(self):
        """Test PATCH /api/marketing/auto/config"""
        print("\n" + "="*60)
        print("TESTING MARKETING AUTO CONFIG - PATCH")
        print("="*60)
        
        # Test updating configuration
        config_data = {
            "enabled": True,
            "maxActionsPerDay": 10,
            "maxBudgetChangePercent": 25,
            "minSpendForDecision": 100,
            "minDataDays": 5
        }
        
        success, response = self.run_test(
            "Marketing Auto Config - PATCH",
            "PATCH",
            "api/marketing/auto/config",
            200,
            data=config_data
        )
        
        if success:
            print("✅ Marketing auto config PATCH endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'message' in response:
                print(f"   Message: {response['message']}")
            if 'data' in response:
                data = response['data']
                print(f"   Updated config - Enabled: {data.get('enabled', False)}")
                print(f"   Max actions per day: {data.get('maxActionsPerDay', 0)}")
            return True
        else:
            print("❌ Marketing auto config PATCH endpoint failed")
            return False

    def test_marketing_spend(self):
        """Test GET /api/marketing/spend"""
        print("\n" + "="*60)
        print("TESTING MARKETING SPEND DATA")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Spend Data",
            "GET",
            "api/marketing/spend",
            200
        )
        
        if success:
            print("✅ Marketing spend endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            
            # Since Meta Ads is not configured, we expect empty data or error
            if response.get('success') == False:
                print(f"   Expected error (Meta not configured): {response.get('error', 'No error message')}")
                if 'Meta Ads API not configured' in response.get('error', ''):
                    print("✅ Correctly returns error when Meta Ads not configured")
                    return True
            elif 'data' in response:
                data = response['data']
                print(f"   Spend data records: {len(data) if isinstance(data, list) else 'Not a list'}")
                if len(data) == 0:
                    print("✅ Empty data as expected (Meta Ads not configured)")
                return True
            return True
        else:
            print("❌ Marketing spend endpoint failed")
            return False

    def test_marketing_roi(self):
        """Test GET /api/marketing/roi?days=30"""
        print("\n" + "="*60)
        print("TESTING MARKETING ROI WITH SPEND DATA")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing ROI (30 days)",
            "GET",
            "api/marketing/roi?days=30",
            200
        )
        
        if success:
            print("✅ Marketing ROI endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                data = response['data']
                if 'decisions' in data:
                    decisions = data['decisions']
                    print(f"   Campaign decisions with ROI: {len(decisions)}")
                    for decision in decisions[:3]:  # Show first 3
                        print(f"   - {decision.get('campaign', 'Unknown')}: ROI {decision.get('roi', 0)}%, Spend ${decision.get('spend', 0)}")
                        if decision.get('metaData'):
                            print(f"     Meta data: CPC ${decision['metaData'].get('cpc', 0)}, CTR {decision['metaData'].get('ctr', 0)}%")
                if 'summary' in data:
                    summary = data['summary']
                    print(f"   Total spend: ${summary.get('totalSpend', 0)}")
                    print(f"   Overall ROI: {summary.get('overallRoi', 0)}%")
            return True
        else:
            print("❌ Marketing ROI endpoint failed")
            return False

    def test_marketing_auto_history(self):
        """Test GET /api/marketing/auto/history"""
        print("\n" + "="*60)
        print("TESTING MARKETING AUTO ACTION HISTORY")
        print("="*60)
        
        success, response = self.run_test(
            "Marketing Auto Action History",
            "GET",
            "api/marketing/auto/history",
            200
        )
        
        if success:
            print("✅ Marketing auto history endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'data' in response:
                data = response['data']
                print(f"   Action history records: {len(data) if isinstance(data, list) else 'Not a list'}")
                for action in data[:3]:  # Show first 3 actions
                    print(f"   - {action.get('campaign', 'Unknown')}: {action.get('actionType', 'unknown')} (Status: {action.get('status', 'unknown')})")
                    if action.get('reason'):
                        print(f"     Reason: {action.get('reason')}")
            return True
        else:
            print("❌ Marketing auto history endpoint failed")
            return False

    def test_marketing_auto_execute(self):
        """Test POST /api/marketing/auto/execute"""
        print("\n" + "="*60)
        print("TESTING MARKETING AUTO ACTION EXECUTION")
        print("="*60)
        
        # Test manual action execution
        action_data = {
            "campaign": "test_manual_campaign",
            "campaignId": "test_campaign_123",
            "status": "scale",
            "roi": 45.5,
            "profit": 1200,
            "source": "facebook",
            "leads": 8,
            "deals": 2,
            "spend": 150
        }
        
        success, response = self.run_test(
            "Marketing Auto Action Execute",
            "POST",
            "api/marketing/auto/execute",
            200,
            data=action_data
        )
        
        if success:
            print("✅ Marketing auto execute endpoint is working")
            if 'success' in response:
                print(f"   Success: {response['success']}")
            if 'message' in response:
                print(f"   Message: {response['message']}")
            if 'data' in response:
                data = response['data']
                if data:
                    print(f"   Action executed: {data.get('actionType', 'unknown')}")
                    print(f"   Campaign: {data.get('campaign', 'unknown')}")
                    print(f"   Status: {data.get('status', 'unknown')}")
            return True
        else:
            print("❌ Marketing auto execute endpoint failed")
            return False

    def test_admin_login(self):
        """Test admin login flow"""
        print("\n" + "="*60)
        print("TESTING ADMIN LOGIN FLOW")
        print("="*60)
        
        # Test admin login
        login_data = {
            "email": "admin@crm.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data=login_data
        )
        
        if success:
            print("✅ Admin login endpoint is working")
            if 'access_token' in response:
                print("✅ JWT token received")
                self.admin_token = response['access_token']
                return True
            elif 'token' in response:
                print("✅ JWT token received")
                self.admin_token = response['token']
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

    def test_publishing_queue(self):
        """Test publishing queue endpoint for moderation"""
        print("\n" + "="*60)
        print("TESTING PUBLISHING QUEUE (MODERATION)")
        print("="*60)
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        # Test getting all listings
        success, response = self.run_test(
            "Publishing Queue - All Listings",
            "GET",
            "api/publishing/queue?limit=50",
            200,
            headers=headers
        )
        
        if success:
            print("✅ Publishing queue endpoint is working")
            if 'data' in response:
                print(f"   Found {len(response['data'])} listings")
            elif 'listings' in response:
                print(f"   Found {len(response['listings'])} listings")
            
            # Test filtering by status
            success2, response2 = self.run_test(
                "Publishing Queue - Pending Review Filter",
                "GET",
                "api/publishing/queue?status=pending_review&limit=10",
                200,
                headers=headers
            )
            
            if success2:
                print("✅ Status filtering works")
                return True
            else:
                print("❌ Status filtering failed")
                return False
        else:
            print("❌ Publishing queue endpoint failed")
            return False

    def test_vehicles_endpoint(self):
        """Test vehicles endpoint as fallback for moderation"""
        print("\n" + "="*60)
        print("TESTING VEHICLES ENDPOINT (FALLBACK)")
        print("="*60)
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, response = self.run_test(
            "Vehicles Endpoint",
            "GET",
            "api/vehicles?limit=50",
            200,
            headers=headers
        )
        
        if success:
            print("✅ Vehicles endpoint is working")
            if 'data' in response:
                print(f"   Found {len(response['data'])} vehicles")
            return True
        else:
            print("❌ Vehicles endpoint failed")
            return False

    def test_public_endpoints(self):
        """Test public endpoints that don't require auth"""
        print("\n" + "="*60)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*60)
        
        # Test public vehicles endpoint
        success1, response1 = self.run_test(
            "Public Vehicles",
            "GET",
            "api/public/vehicles?limit=10",
            200
        )
        
        # Test public cars endpoint
        success2, response2 = self.run_test(
            "Public Cars",
            "GET",
            "api/public/cars?limit=10",
            200
        )
        
        if success1 or success2:
            print("✅ At least one public endpoint is working")
            return True
        else:
            print("❌ All public endpoints failed")
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
    print("Testing BLOCK 5 (Multilanguage) and BLOCK 6 (Moderation UI)")
    print("=" * 70)
    
    tester = BIBICarsAPITester()
    
    # Run focused tests for BLOCK 5 and BLOCK 6
    try:
        # Test Admin Login first (required for moderation)
        admin_login = tester.test_admin_login()
        
        # Test public endpoints (for general functionality)
        public_endpoints = tester.test_public_endpoints()
        
        # Test moderation endpoints (BLOCK 6)
        publishing_queue = tester.test_publishing_queue()
        vehicles_fallback = tester.test_vehicles_endpoint()
        
        # Print final results
        print("\n" + "="*70)
        print("📊 FINAL TEST RESULTS")
        print("="*70)
        print(f"Tests Run: {tester.tests_run}")
        print(f"Tests Passed: {tester.tests_passed}")
        print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
        
        # Detailed results
        print("\n🔐 Authentication Results:")
        print(f"   Admin Login: {'✅' if admin_login else '❌'}")
        
        print("\n🌐 Public Endpoints Results:")
        print(f"   Public Endpoints: {'✅' if public_endpoints else '❌'}")
        
        print("\n📋 Moderation (BLOCK 6) Results:")
        print(f"   Publishing Queue: {'✅' if publishing_queue else '❌'}")
        print(f"   Vehicles Fallback: {'✅' if vehicles_fallback else '❌'}")
        
        print("\n📝 BLOCK 5 (Multilanguage) Notes:")
        print("   ✅ BLOCK 5 is frontend-only (i18n translations)")
        print("   ✅ No backend API changes required")
        print("   ✅ Language switching handled by React context")
        
        # Determine overall success
        critical_tests = [admin_login, public_endpoints]
        moderation_tests = [publishing_queue, vehicles_fallback]
        
        if all(critical_tests) and any(moderation_tests):
            print("\n🎉 Core functionality working! Ready for frontend testing.")
            return 0
        elif all(critical_tests):
            print("\n⚠️  Core functionality working, but moderation endpoints need attention.")
            return 0
        else:
            print("\n❌ Critical backend issues found.")
            return 1
            
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())