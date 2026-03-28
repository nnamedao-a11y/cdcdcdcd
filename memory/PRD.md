# BIBI Cars CRM - Product Requirements Document

## Overview
BIBI Cars CRM - End-to-End Revenue Machine для автобізнесу з аукціонів США та Європи.

**Статус:** Production-Ready Revenue System

## Architecture
- **Backend**: NestJS + MongoDB (TypeScript)
- **Frontend**: React + Tailwind CSS + Recharts
- **Database**: MongoDB
- **Notifications**: Multi-Channel (Telegram + Viber)
- **AI Engine**: Recommendation + Revenue Optimization + Marketing Automation

## COMPLETED MODULES

### Core CRM (Phase 1) ✅
1. VIN Engine - VIN search, decode, history
2. Calculator - Quote generation, price calculation
3. CRM - Leads, Customers, Deals pipeline
4. Analytics - Quote analytics, Manager performance
5. Customer Cabinet - Client portal

### Notification System (Phase 2) ✅
6. Smart Notification Engine
7. Telegram Bot (webhook configured)
8. Viber Bot
9. Multi-Channel Orchestrator

### AI Recommendations (Phase 3) ✅
10. User Preference Profiling
11. Personalized Recommendations
12. "You Missed This" Alerts
13. Auction-Soon Alerts
14. CRON Automation

### Revenue AI (Phase 4) ✅
15. Intent Scoring (cold/warm/hot)
16. Dynamic Pricing (0.90x - 1.15x)
17. Manager AI Assist
18. Discount Recommendations
19. Deal Closing Logic

### Analytics & Tracking (Phase 5) ✅
20. Event Tracking (buffered sendBeacon)
21. Source Attribution (UTM)
22. Funnel Analysis
23. Fake Traffic Detection
24. Dashboard API

### Marketing Automation (Phase 6) ✅ (NEW)
25. Facebook Conversion API (CAPI)
26. Auto Budget Optimizer
27. Campaign Performance Aggregation
28. ROI Tracking
29. Admin Analytics Dashboard UI

## Architecture Diagrams

### Marketing Automation Flow
```
Traffic Source
→ UTM Tracking
→ Analytics Events
→ Lead/Deal Attribution
→ Facebook CAPI (events back to FB)
→ Auto Budget Optimizer
   → SCALE (ROI > 30%)
   → KEEP (ROI 10-30%)
   → WATCH (needs data)
   → KILL (burning money)
→ Admin Dashboard
```

### Revenue AI Flow
```
User Behavior (saved/viewed/quotes)
→ Intent Scoring Service
   → cold (0-2 pts)
   → warm (3-5 pts)
   → hot (6+ pts)
→ Dynamic Pricing (0.90x - 1.15x)
→ Manager AI Assist (advice)
→ Deal Closing Logic (urgency)
```

## API Endpoints Summary

### Marketing
- `GET /api/marketing/status`
- `GET /api/marketing/campaigns?days=30`
- `GET /api/marketing/sources?days=30`
- `GET /api/marketing/recommendations?days=30`
- `POST /api/marketing/optimize`
- `POST /api/marketing/fb-event` (requires FB creds)

### Revenue AI
- `GET /api/revenue-ai/intent?customerId=xxx`
- `POST /api/revenue-ai/price`
- `GET /api/revenue-ai/margin?customerId=xxx`
- `GET /api/revenue-ai/deal-advice?dealId=xxx`
- `GET /api/revenue-ai/manager-dashboard?managerId=xxx`

### Analytics
- `POST /api/analytics/track`
- `GET /api/analytics/dashboard?days=30`
- `GET /api/analytics/funnel?days=30`
- `GET /api/analytics/sources?days=30`

## Frontend Routes

### Admin Panel
- `/admin` - Dashboard
- `/admin/analytics` - Marketing Analytics Dashboard ✅ NEW
- `/admin/analytics/quotes` - Quote Analytics
- `/admin/leads` - Leads management
- `/admin/customers` - Customers
- `/admin/deals` - Deals pipeline
- `/admin/calculator` - Calculator admin

## Environment Variables

```env
# MongoDB
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# JWT
JWT_SECRET="bibi-cars-crm-secret-key-2026-super-secure"
CUSTOMER_JWT_SECRET="bibi-cars-customer-secret-key-2026"

# Telegram
TELEGRAM_BOT_TOKEN=7757775952:AAFTqDABFhTuOsaDlhFh2noUsqc4QPGFaGE
TELEGRAM_BOT_USERNAME=Bibicars_bot

# Facebook (optional - for CAPI)
FB_PIXEL_ID=
FB_ACCESS_TOKEN=

# General
PUBLIC_SITE_URL=https://a11y-review.preview.emergentagent.com
```

## Auto Budget Optimizer Rules

| Status | Conditions | Action |
|--------|------------|--------|
| SCALE | ROI > 30%, Deals >= 3, Fake < 10% | Increase budget 15-20% |
| KEEP | ROI 10-30%, Leads >= 5 | Monitor |
| WATCH | Low data or mixed signals | Optimize |
| KILL | Spend high, Deals = 0, Fake > 30% | Pause immediately |

## What's Been Implemented (2026-03-28)

### Marketing Module
- ✅ Facebook Conversion API service (needs credentials)
- ✅ Auto Budget Optimizer (rule-based)
- ✅ Marketing Performance aggregation
- ✅ Campaign decisions (scale/keep/watch/kill)
- ✅ ROI calculation
- ✅ Source attribution

### Admin Analytics Dashboard
- ✅ KPI Cards (Visits, Sessions, Leads, Deals, Conversion)
- ✅ Funnel visualization
- ✅ Sources table with ROI
- ✅ Campaign Optimizer with decisions
- ✅ Fake traffic alerts
- ✅ Timeline chart (Recharts)

### Frontend Analytics Tracker
- ✅ sendBeacon-based event tracking
- ✅ UTM parameter capture
- ✅ Session management
- ✅ Auto page view tracking
- ✅ Custom event helpers

## Prioritized Backlog

### P0 (Critical) - ALL DONE ✅
- [x] Core CRM
- [x] Notification System
- [x] AI Recommendations
- [x] Revenue AI
- [x] Analytics Tracking
- [x] Marketing Automation
- [x] Admin Analytics Dashboard

### P1 (High Priority) - Next
- [ ] Facebook CAPI credentials setup
- [ ] Meta Ads API spend sync
- [ ] Auto-pause/scale actions (API integration)
- [ ] Email channel (Resend/SendGrid)

### P2 (Medium Priority)
- [ ] Google Ads integration
- [ ] TikTok Ads integration
- [ ] A/B testing for creatives
- [ ] Advanced predictive analytics

### P3 (Low Priority)
- [ ] ML-based recommendations
- [ ] Chatbot AI
- [ ] Voice search

---

## SYSTEM STATUS

**Backend:** 100% Operational
**Frontend:** 100% Operational
**Telegram Bot:** Configured & Working
**Facebook CAPI:** Ready (needs credentials)
**Analytics:** Tracking & Dashboard Live

**Last Updated:** 2026-03-28
