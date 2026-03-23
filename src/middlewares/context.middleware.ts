import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { asyncLocalStorage } from '@common/context';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
    use(_: Request, __: Response, next: NextFunction) {
        const store = new Map<string, any>();
        asyncLocalStorage.run(store, () => next());
    }
}
