import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { FacebookConversionService } from './facebook-conversion.service';
import { AutoBudgetOptimizerService, CampaignMetrics } from './auto-budget-optimizer.service';
import { MarketingPerformanceService } from './marketing-performance.service';

/**
 * Marketing Controller
 * 
 * API for marketing automation and optimization
 */
@Controller('marketing')
export class MarketingController {
  private readonly logger = new Logger(MarketingController.name);

  constructor(
    private readonly facebookService: FacebookConversionService,
    private readonly optimizer: AutoBudgetOptimizerService,
    private readonly performance: MarketingPerformanceService,
  ) {}

  /**
   * Service status
   */
  @Get('status')
  async getStatus() {
    return {
      ok: true,
      service: 'marketing',
      version: '1.0.0',
      features: [
        'facebook_conversion_api',
        'auto_budget_optimizer',
        'campaign_performance',
        'source_attribution',
      ],
      facebookCapi: {
        configured: this.facebookService.isConfigured(),
        pixelId: process.env.FB_PIXEL_ID ? '***configured***' : 'not set',
      },
    };
  }

  /**
   * Get campaign performance with optimization decisions
   * GET /api/marketing/campaigns?days=30
   */
  @Get('campaigns')
  async getCampaigns(@Query('days') days: string) {
    const daysNum = parseInt(days || '30', 10);
    const result = await this.performance.getCampaignPerformance(daysNum);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get source-level summary
   * GET /api/marketing/sources?days=30
   */
  @Get('sources')
  async getSources(@Query('days') days: string) {
    const daysNum = parseInt(days || '30', 10);
    const sources = await this.performance.getSourceSummary(daysNum);
    
    return {
      success: true,
      data: sources,
    };
  }

  /**
   * Evaluate campaigns with spend data
   * POST /api/marketing/optimize
   */
  @Post('optimize')
  async optimize(@Body() body: {
    campaigns: CampaignMetrics[];
    spendData?: { campaign: string; spend: number }[];
  }) {
    // If raw campaign data provided, evaluate directly
    if (body.campaigns && body.campaigns.length > 0) {
      const decisions = this.optimizer.evaluateAll(body.campaigns);
      const summary = this.optimizer.getSummary(decisions);
      
      return {
        success: true,
        data: { decisions, summary },
      };
    }

    // Otherwise, get from database
    const result = await this.performance.getCampaignPerformance(30, body.spendData);
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Manually send Facebook event (for testing)
   * POST /api/marketing/fb-event
   */
  @Post('fb-event')
  async sendFacebookEvent(@Body() body: {
    eventType: 'lead' | 'quote' | 'purchase' | 'search' | 'view';
    data: any;
  }) {
    if (!this.facebookService.isConfigured()) {
      return {
        success: false,
        error: 'Facebook CAPI not configured. Set FB_PIXEL_ID and FB_ACCESS_TOKEN.',
      };
    }

    let result = false;

    switch (body.eventType) {
      case 'lead':
        result = await this.facebookService.trackLead(body.data);
        break;
      case 'quote':
        result = await this.facebookService.trackQuote(body.data);
        break;
      case 'purchase':
        result = await this.facebookService.trackPurchase(body.data);
        break;
      case 'search':
        result = await this.facebookService.trackSearch(body.data);
        break;
      case 'view':
        result = await this.facebookService.trackViewContent(body.data);
        break;
    }

    return {
      success: result,
      message: result ? 'Event sent to Facebook' : 'Failed to send event',
    };
  }

  /**
   * Get optimization recommendations
   * GET /api/marketing/recommendations?days=30
   */
  @Get('recommendations')
  async getRecommendations(@Query('days') days: string) {
    const daysNum = parseInt(days || '30', 10);
    const result = await this.performance.getCampaignPerformance(daysNum);
    
    const { summary, decisions } = result;

    // Build actionable recommendations
    const scaleCampaigns = decisions.filter(d => d.status === 'scale');
    const killCampaigns = decisions.filter(d => d.status === 'kill');
    const watchCampaigns = decisions.filter(d => d.status === 'watch');

    const recommendations: Array<{
      priority: string;
      action: string;
      campaign: string;
      source: string;
      message: string;
      suggestion: string;
    }> = [];

    // Scale recommendations
    scaleCampaigns.forEach(c => {
      recommendations.push({
        priority: 'high',
        action: 'scale',
        campaign: c.campaign,
        source: c.source,
        message: `Scale "${c.campaign}" - ROI ${c.roi}%, ${c.deals} deals`,
        suggestion: 'Increase budget by 15-20%',
      });
    });

    // Kill recommendations
    killCampaigns.forEach(c => {
      recommendations.push({
        priority: 'urgent',
        action: 'kill',
        campaign: c.campaign,
        source: c.source,
        message: `Stop "${c.campaign}" - wasting $${c.spend}`,
        suggestion: c.reasons.join(', '),
      });
    });

    // Watch recommendations
    watchCampaigns.slice(0, 5).forEach(c => {
      recommendations.push({
        priority: 'medium',
        action: 'watch',
        campaign: c.campaign,
        source: c.source,
        message: `Monitor "${c.campaign}"`,
        suggestion: c.actions.join(', '),
      });
    });

    return {
      success: true,
      data: {
        summary,
        recommendations: recommendations.sort((a, b) => {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (order[a.priority as keyof typeof order] || 3) - (order[b.priority as keyof typeof order] || 3);
        }),
      },
    };
  }
}
