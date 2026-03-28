import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingController } from './marketing.controller';
import { FacebookConversionService } from './facebook-conversion.service';
import { AutoBudgetOptimizerService } from './auto-budget-optimizer.service';
import { MarketingPerformanceService } from './marketing-performance.service';
import { AnalyticsEventSchema } from '../analytics-tracking/analytics-event.schema';
import { LeadSchema } from '../leads/lead.schema';
import { DealSchema } from '../deals/deal.schema';
import { QuoteSchema } from '../calculator/schemas/quote.schema';

/**
 * Marketing Module
 * 
 * Marketing automation and optimization:
 * - Facebook Conversion API
 * - Auto Budget Optimizer
 * - Campaign Performance
 * - ROI Tracking
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AnalyticsEvent', schema: AnalyticsEventSchema },
      { name: 'Lead', schema: LeadSchema },
      { name: 'Deal', schema: DealSchema },
      { name: 'Quote', schema: QuoteSchema },
    ]),
  ],
  controllers: [MarketingController],
  providers: [
    FacebookConversionService,
    AutoBudgetOptimizerService,
    MarketingPerformanceService,
  ],
  exports: [
    FacebookConversionService,
    AutoBudgetOptimizerService,
    MarketingPerformanceService,
  ],
})
export class MarketingModule {}
