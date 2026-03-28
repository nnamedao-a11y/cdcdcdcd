# BIBI Cars CRM - Product Requirements Document

## Overview
BIBI Cars CRM - End-to-End Revenue Machine для автобізнесу з аукціонів США та Європи.

**Статус:** Production-Ready Growth System v2.0

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

### Marketing Automation (Phase 6) ✅
25. Facebook Conversion API (CAPI)
26. Auto Budget Optimizer
27. Campaign Performance Aggregation
28. ROI Tracking
29. Admin Analytics Dashboard UI

### Meta Ads API Integration (Phase 7) ✅ NEW
30. Meta Ads Service - Spend sync from Facebook
31. Campaign Spend Schema - Store spend data
32. Auto Action Service - Pause/Scale/Decrease
33. Safety Layer - Daily limits, min spend checks
34. Auto Mode Config - Enable/disable automation
35. Action History - Full audit log
36. ROI Endpoint - Real spend + profit = true ROI

## Architecture Diagrams

### Meta Ads Flow (NEW)
```
Meta Ads API
→ Campaign Insights (spend, clicks, impressions)
→ Campaign Spend Schema (MongoDB)
→ ROI Calculation (profit / spend)
→ Auto Budget Optimizer (scale/keep/watch/kill)
→ Auto Actions (pause/increase/decrease budget)
→ Admin Dashboard
```

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
→ Auto Actions (Meta API)
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
- `GET /api/marketing/status` - Service status with Meta Ads info
- `GET /api/marketing/campaigns?days=30` - Campaign performance
- `GET /api/marketing/sources?days=30` - Source summary
- `GET /api/marketing/recommendations?days=30` - AI recommendations
- `POST /api/marketing/optimize` - Evaluate campaigns
- `POST /api/marketing/fb-event` - Send FB event (requires FB creds)

### Meta Ads API (NEW)
- `GET /api/marketing/spend` - Get synced spend data
- `POST /api/marketing/spend/sync` - Manual sync spend
- `GET /api/marketing/meta/insights?days=7` - Direct Meta insights
- `GET /api/marketing/roi?days=30` - Campaigns with real ROI

### Auto Actions (NEW)
- `GET /api/marketing/auto/config` - Get auto mode config
- `PATCH /api/marketing/auto/config` - Update config
- `GET /api/marketing/auto/history?days=30` - Action history
- `POST /api/marketing/auto/execute` - Execute action manually

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
- `/admin/analytics` - Marketing Analytics Dashboard ✅
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

# Meta Ads API (NEW - for spend sync)
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=

# General
PUBLIC_SITE_URL=https://8afbde17-e19b-412a-8fd2-16f05c96d9c0.preview.emergentagent.com
```

## Auto Mode Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| enabled | false | Enable auto actions |
| maxActionsPerDay | 5 | Daily limit |
| maxBudgetChangePercent | 20 | Max budget change |
| minSpendForDecision | 50 | Min spend for action |
| minDataDays | 3 | Min days of data |

## Auto Budget Optimizer Rules

| Status | Conditions | Action |
|--------|------------|--------|
| SCALE | ROI > 30%, Deals >= 3, Fake < 10% | Increase budget 15-20% |
| KEEP | ROI 10-30%, Leads >= 5 | Monitor |
| WATCH | Low data or mixed signals | Optimize |
| KILL | Spend high, Deals = 0, Fake > 30% | Pause immediately |

## What's Been Implemented

### 2026-03-28 (Latest Update)
- ✅ Meta Ads Service - API integration for spend sync
- ✅ Campaign Spend Schema - MongoDB storage
- ✅ Auto Action Service - Pause/scale/decrease
- ✅ Safety Layer - Limits and checks
- ✅ New API endpoints for Meta Ads and auto actions
- ✅ Marketing controller v2.0

### Previous
- ✅ Facebook Conversion API service (needs credentials)
- ✅ Auto Budget Optimizer (rule-based)
- ✅ Marketing Performance aggregation
- ✅ Campaign decisions (scale/keep/watch/kill)
- ✅ ROI calculation
- ✅ Source attribution
- ✅ Admin Analytics Dashboard with KPI, Funnel, Sources, Optimizer
- ✅ Analytics Tracker with sendBeacon

## Prioritized Backlog

### P0 (Critical) - ALL DONE ✅
- [x] Core CRM
- [x] Notification System
- [x] AI Recommendations
- [x] Revenue AI
- [x] Analytics Tracking
- [x] Marketing Automation
- [x] Admin Analytics Dashboard
- [x] Meta Ads API Integration
- [x] Auto Actions System

### P1 (High Priority) - Credentials Needed
- [ ] Set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID for real spend sync
- [ ] Set FB_PIXEL_ID and FB_ACCESS_TOKEN for CAPI

### P2 (Medium Priority)
- [ ] Google Ads integration
- [ ] TikTok Ads integration
- [ ] Email channel (Resend/SendGrid)
- [ ] A/B testing for creatives

### P3 (Low Priority)
- [ ] ML-based recommendations
- [ ] Chatbot AI
- [ ] Voice search

---

## SYSTEM STATUS

**Backend:** 100% Operational (v2.0.0)
**Frontend:** 100% Operational
**Telegram Bot:** Configured & Working
**Facebook CAPI:** Ready (needs credentials)
**Meta Ads API:** Ready (needs credentials)
**Analytics:** Tracking & Dashboard Live
**Auto Actions:** Ready (disabled by default)

### Marketing Layer Status: CLOSED ✅

**Implemented:**
- ✅ UTM Consistency utilities (extractUTM, normalizeCampaign)
- ✅ Lead Validation utilities (isValidLead, getLeadQuality)
- ✅ ROI Calculation utilities (calculateROI with fallbacks)
- ✅ Decision Logging (why system made each decision)
- ✅ Marketing Control Panel UI with 4 tabs (Overview, Campaigns, Automation, History)
- ✅ Campaign Actions UI (Scale/Kill buttons)
- ✅ Auto Mode Control UI (toggle, settings)
- ✅ Spend Sync Status UI
- ✅ Action History UI

**Final Checklist:**
- [x] Traffic → CRM → Analytics → ROI → Actions loop
- [x] UTM tracking consistency
- [x] Lead validation (no garbage data)
- [x] Safe ROI display (null when no spend)
- [x] Decision logging for transparency
- [x] Full UI for all marketing endpoints

**Admin Routes:**
- `/admin/analytics` - Analytics Dashboard
- `/admin/marketing` - Marketing Control Panel

**Last Updated:** 2026-03-28
