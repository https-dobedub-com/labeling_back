import {
    ArgumentsHost,
    Catch,
    ExceptionFilter as NestExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Context, ContextKey } from '@common/context';
import { ConfigsService } from '@configs';
import { getLogContext } from '@libs/logger';

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
    private readonly logger = new Logger(ExceptionFilter.name);

    constructor(
        private readonly context: Context,
        private readonly configsService: ConfigsService
    ) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const http = host.switchToHttp();
        const request = http.getRequest<Request>();
        const response = http.getResponse<Response>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const traceId = this.context.get<string>(ContextKey.TRACE_ID);
        const exceptionResponse =
            exception instanceof HttpException ? exception.getResponse() : 'Internal Server Error';
        const stack = exception instanceof Error ? exception.stack : undefined;

        const payload = {
            message: `[${request.method}] ${request.url} - ${traceId}${this.configsService.isLocal() && stack ? `\n${stack}` : ''}`,
            traceId,
            error: exceptionResponse,
            stack,
            ...getLogContext(request),
        };

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(payload);
        } else {
            this.logger.warn(payload);
        }

        const message =
            status >= HttpStatus.INTERNAL_SERVER_ERROR
                ? '서버에 예기치 않은 오류가 발생했습니다.'
                : exception instanceof Error && exception.cause
                  ? String(exception.cause)
                  : typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : ((exceptionResponse as { message?: string | string[] }).message ?? '잘못된 요청입니다.');

        response.status(status).json({
            data: {
                message,
            },
        });
    }
}
