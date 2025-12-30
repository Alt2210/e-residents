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
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, 
          { message, session_id: sessionId }, // Đảm bảo key khớp với AI Server
          { 
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true' // QUAN TRỌNG: Bỏ qua trang cảnh báo của ngrok
            } 
          }
        ),
      );
      return { reply: response.data };
    } catch (error) {
      throw new HttpException('AI Server không phản hồi (502)', HttpStatus.BAD_GATEWAY);
    }
  }
}