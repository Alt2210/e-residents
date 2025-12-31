import { Controller, Post, Body, Res } from '@nestjs/common'; // Thêm Res ở đây
import { ChatbotService } from './chatbot.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express'; // Import type để có gợi ý code tốt hơn

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @ApiOperation({ summary: 'Gửi câu hỏi và nhận phản hồi dạng stream' })
  async ask(
    @Body('query') query: string,          
    @Body('session_id') session_id: string, 
    @Res() res: Response                   
  ) {
    try {
      const stream = await this.chatbotService.chat(query, session_id);

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      stream.pipe(res);

      stream.on('error', (err) => {
        console.error('Stream error:', err);
        res.end();
      });
    } catch (error) {
      console.error('Lỗi khi khởi tạo stream:', error.message);
      res.status(502).send('AI Server không phản hồi hoặc lỗi kết nối.');
    }
  }
}