import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger'; // Import thêm

@ApiTags('Chatbot') // Thêm tag này để Swagger phân nhóm API Chatbot
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Gửi câu hỏi cho trợ lý ảo AI' }) // Thêm mô tả cho API
  async ask(
    @Body('message') message: string, 
    @Body('sessionId') sessionId: string
  ) {
    const id = sessionId || 'session-' + Date.now();
    return this.chatbotService.chat(message, id);
  }
}