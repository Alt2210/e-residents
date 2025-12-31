import { Controller, Get, Patch, Param, UseGuards, Request, Post } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
  
  // API Test để bạn tự tạo thông báo thử nghiệm
  @Post('test-create')
  async createTest(@Request() req: any) {
    return this.notificationsService.create(
       req.user.userId, 
       'Chào mừng quay lại', 
       'Đây là thông báo thử nghiệm từ hệ thống.', 
       'SUCCESS'
    );
  }
}