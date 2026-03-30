import 'reflect-metadata';
import compression from 'compression';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigsService } from '@configs';
import { logger } from '@libs/logger';
import { requesterValidatorPipe } from '@libs/pipes';

(async () => {
    const app = await NestFactory.create(AppModule, { logger });
    const configsService = app.get(ConfigsService);

    app.enableCors();
    app.use(compression());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(requesterValidatorPipe);
    app.enableShutdownHooks();

    await app.listen(configsService.app.port);

    logger.log(
        `[bootstrap] ${configsService.app.name} is running on http://localhost:${configsService.app.port}`
    );
})();
