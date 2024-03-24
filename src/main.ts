import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cors from 'cors'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });


  const config = new DocumentBuilder()
    .setTitle("Casino BACK")
    .setDescription("Описание апи")
    .setVersion("1.2")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("swagger", app, document)

  app.use(cors({
    allowedHeaders: ['content-type, Authorization'],
    credentials: true,
    origin: 'http://localhost:3000'
  }))
  await app.listen(3000);
}
bootstrap();
