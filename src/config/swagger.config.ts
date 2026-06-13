import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Zara School')
    .setDescription('API for Zara School backend')
    .setVersion('1.0')
    .addTag('zaraSchool')
    .addBearerAuth()
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);
}
