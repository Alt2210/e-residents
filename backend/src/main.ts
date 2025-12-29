import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

// Hàm cấu hình chung cho cả Local và Production
function setupApp(app: INestApplication) {
  // 1. Prefix cho API (Để tất cả API bắt đầu bằng /api)
  app.setGlobalPrefix('api');

  // 2. Cấu hình CORS - QUAN TRỌNG ĐỂ SỬA LỖI CỦA BẠN
  app.enableCors({
    origin: ['http://localhost:3000', 'https://e-residents-alpha.vercel.app'], // Cho phép frontend của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Residents API')
    .setDescription('Hệ thống quản lý dân cư')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

let cachedApp: any;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule);
  
  // Gọi hàm cấu hình chung
  setupApp(app);

  await app.init();
  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

// XỬ LÝ CHẠY LOCAL
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  NestFactory.create(AppModule).then(async (app) => {
    // Gọi cùng một hàm cấu hình như Vercel
    setupApp(app);

    await app.listen(PORT, () => {
      console.log(`--- Server local đang chạy ---`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Swagger: http://localhost:${PORT}/docs`);
    });
  });
}

// EXPORT CHO VERCEL
export default async (req: any, res: any) => {
  const server = await bootstrap();
  server(req, res);
};