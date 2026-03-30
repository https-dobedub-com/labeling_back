import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { Context, ContextKey } from '@common/context';

@Injectable()
export class UUIDMiddleware implements NestMiddleware {
    constructor(private readonly context: Context) {}

    use(req: Request, _: Response, next: NextFunction) {
        const traceId = req.get('x-request-id');
        this.context.set(ContextKey.TRACE_ID, traceId);
        next();
    }
}
