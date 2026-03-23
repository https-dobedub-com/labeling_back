import { writeFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module';

(async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    const config = new DocumentBuilder().setTitle('labeling-back').setDescription('labeling api').setVersion('1.0.0').build();
    const document = SwaggerModule.createDocument(app, config);

    writeFileSync('swagger.json', JSON.stringify(document, null, 2), 'utf8');
    await app.close();
})();
