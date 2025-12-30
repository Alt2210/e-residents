// src/chatbot/chatbot.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // src/chatbot/chatbot.service.ts
  async chat(message: string, sessionId: string): Promise<any> {
    const apiUrl = this.configService.getOrThrow<string>('CHATBOT_API_URL');
    
    // Đổi key gửi đi thành 'query' theo yêu cầu của Server AI
    const payload = {
      query: message, 
      session_id: sessionId 
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, payload, {
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // Vượt qua trang chặn của ngrok
          },
          timeout: 60000 // Tăng thời gian chờ cho AI xử lý
        }),
      );

      return {
        reply: response.data.response || response.data.reply || response.data
      };
    } catch (error) {
      console.error('Lỗi kết nối AI:', error.message);
      throw new HttpException('AI Server không phản hồi', HttpStatus.BAD_GATEWAY);
    }
  }
}