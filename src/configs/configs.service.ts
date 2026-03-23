import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { DataSourceOptions } from 'typeorm';
import type { AppRuntimeConfig } from './configuration';

@Injectable()
export class ConfigsService {
    constructor(private readonly configService: NestConfigService) {}

    isProduction() {
        return process.env.NODE_ENV === 'production';
    }

    isLocal() {
        return process.env.NODE_ENV === 'local' || !process.env.NODE_ENV;
    }

    isDevelopment() {
        return process.env.NODE_ENV === 'development';
    }

    get app() {
        return this.configService.get<AppRuntimeConfig>('app')!;
    }

    get database() {
        return this.configService.get<DataSourceOptions>('database')!;
    }
}
