import type { DataSourceOptions } from 'typeorm';

export interface AppRuntimeConfig {
    name: string;
    port: number;
    corsOrigins: string[];
}

interface AppConfig {
    app: AppRuntimeConfig;
    database: DataSourceOptions;
}

const toNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
    if (value === undefined) {
        return fallback;
    }

    return value === 'true';
};

const toList = (value: string | undefined, fallback: string[]) => {
    if (!value) {
        return fallback;
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

export default (env: Record<string, string | undefined> = process.env): AppConfig => {
    const isProduction = env.NODE_ENV === 'production';
    const databaseType = env.DB_TYPE === 'mysql' ? 'mysql' : 'sqlite';

    const database =
        databaseType === 'mysql'
            ? ({
                  type: 'mysql',
                  host: env.MYSQL_HOST ?? 'localhost',
                  port: toNumber(env.MYSQL_PORT, 3306),
                  username: env.MYSQL_USERNAME ?? 'root',
                  password: env.MYSQL_PASSWORD ?? '1234',
                  database: env.MYSQL_DATABASE ?? 'labeling',
                  synchronize: !isProduction && toBoolean(env.DB_SYNCHRONIZE, true),
                  logging: toBoolean(env.DB_LOGGING, false),
                  timezone: 'Z',
              } satisfies DataSourceOptions)
            : ({
                  type: 'sqlite',
                  database: env.SQLITE_DATABASE ?? 'labeling.sqlite',
                  synchronize: !isProduction && toBoolean(env.DB_SYNCHRONIZE, true),
                  logging: toBoolean(env.DB_LOGGING, false),
              } satisfies DataSourceOptions);

    return {
        app: {
            name: env.APP_NAME ?? 'labeling-back',
            port: toNumber(env.SERVER_PORT, 3000),
            corsOrigins: toList(env.APP_CORS_ORIGINS, ['http://localhost:3000', 'http://localhost:5173']),
        },
        database,
    };
};
