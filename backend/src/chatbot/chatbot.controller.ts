// Trước khi sửa:
// import { Response } from 'express'; 

// Sau khi sửa:
import type { Response } from 'express'; 
import { Controller, Post, Body, Res } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Gửi câu hỏi cho trợ lý ảo AI' })
  async ask(
    @Body('message') message: string, 
    @Body('sessionId') sessionId: string,
    @Res() res: Response // NestJS sẽ không còn báo lỗi TS1272 nữa
  ) {
    const id = sessionId || 'session-' + Date.now();
    const result = await this.chatbotService.chat(message, id);
    return res.json(result);
  }
}