import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BuildForce School')
    .setDescription('API for BuildForce backend')
    .setVersion('1.0')
    .addTag('BuildForce')
    .addBearerAuth()
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);
}
