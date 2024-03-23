import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const config = new DocumentBuilder()
    .setTitle("Casino BACK")
    .setDescription("Описание апи")
    .setVersion("1.2")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("swagger", app, document)


  await app.listen(3000);
}
bootstrap();
