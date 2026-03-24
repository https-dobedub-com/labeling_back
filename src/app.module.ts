import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CommonModule } from '@common/common.module';
import { ConfigsModule } from '@configs';
import { DatabasesModule } from '@databases';
import { ExceptionFilter } from '@libs/filters';
import { RequestLoggerInterceptor, TraceIdSubscriber } from '@libs/interceptors';
import { ContextMiddleware, UUIDMiddleware } from '@middlewares';
import generalsModule from './services/generals';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigsModule,
        DatabasesModule,
        CommonModule,
        EventEmitterModule.forRoot(),
        ...generalsModule,
    ],
    controllers: [HealthController],
    providers: [
        TraceIdSubscriber,
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestLoggerInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ContextMiddleware, UUIDMiddleware).forRoutes('*');
    }
}
