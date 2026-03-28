import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CustomerCabinetService } from './customer-cabinet.service';

/**
 * Customer Cabinet Controller
 * 
 * Client Process Center API
 * 
 * Routes:
 * - GET /:customerId/dashboard - головна сторінка кабінету
 * - GET /:customerId/requests - мої заявки (leads)
 * - GET /:customerId/orders - мої замовлення (deals)
 * - GET /:customerId/orders/:dealId - деталі замовлення
 * - GET /:customerId/deposits - мої депозити
 * - GET /:customerId/timeline - історія подій
 * - GET /:customerId/notifications - сповіщення
 * - GET /:customerId/profile - профіль
 */

@Controller('customer-cabinet')
export class CustomerCabinetController {
  constructor(private readonly service: CustomerCabinetService) {}

  // ============ DASHBOARD ============
  @Get(':customerId/dashboard')
  getDashboard(@Param('customerId') customerId: string) {
    return this.service.getDashboard(customerId);
  }

  // ============ MY REQUESTS ============
  @Get(':customerId/requests')
  getRequests(
    @Param('customerId') customerId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getRequests(customerId, {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  // ============ MY ORDERS ============
  @Get(':customerId/orders')
  getOrders(
    @Param('customerId') customerId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getOrders(customerId, {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':customerId/orders/:dealId')
  getOrderDetails(
    @Param('customerId') customerId: string,
    @Param('dealId') dealId: string,
  ) {
    return this.service.getOrderDetails(customerId, dealId);
  }

  // ============ MY DEPOSITS ============
  @Get(':customerId/deposits')
  getDeposits(
    @Param('customerId') customerId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getDeposits(customerId, {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  // ============ NOTIFICATIONS ============
  @Get(':customerId/notifications')
  getNotifications(
    @Param('customerId') customerId: string,
    @Query('unread') unread?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getNotifications(customerId, {
      unreadOnly: unread === 'true',
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Patch(':customerId/notifications/:notificationId/read')
  markNotificationAsRead(
    @Param('customerId') customerId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.service.markNotificationAsRead(customerId, notificationId);
  }

  // ============ TIMELINE ============
  @Get(':customerId/timeline')
  getTimeline(
    @Param('customerId') customerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.service.getTimeline(customerId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      type,
    });
  }

  // ============ PROFILE ============
  @Get(':customerId/profile')
  getProfile(@Param('customerId') customerId: string) {
    return this.service.getProfile(customerId);
  }
}
