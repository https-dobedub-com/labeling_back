import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { Context, ContextKey } from '@common/context';
import { getLogContext } from '@libs/logger';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RequestLoggerInterceptor.name);

    private readonly ignoredPaths = ['/health', '/favicon.ico'];

    constructor(private readonly context: Context) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const startedAt = Date.now();

        if (this.ignoredPaths.some((path) => request.url.startsWith(path))) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(() => {
                this.logger.log({
                    message: `[${request.method}] ${request.url} (${Date.now() - startedAt}ms) - ${this.context.get<string>(ContextKey.TRACE_ID)}`,
                    traceId: this.context.get<string>(ContextKey.TRACE_ID),
                    ...getLogContext(request),
                });
            })
        );
    }
}
