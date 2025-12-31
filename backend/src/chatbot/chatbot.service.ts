import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async chat(query: string, session_id: string): Promise<any> {
    const apiUrl = this.configService.getOrThrow<string>('CHATBOT_API_URL');
    
    const response = await this.httpService.axiosRef.post(
      apiUrl, 
      { query, session_id }, 
      { 
        responseType: 'stream', 
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        }
      }
    );

    return response.data; 
  }
}