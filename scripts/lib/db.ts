import mysql, { type Pool } from 'mysql2/promise';

type EnvPrefix = 'SOURCE_DB' | 'TARGET_DB';

const required = (name: string) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required env: ${name}`);
    }

    return value;
};

const optionalPort = (name: string, fallback: number) => {
    const value = process.env[name];

    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const createPoolFromEnv = (prefix: EnvPrefix): Pool => {
    return mysql.createPool({
        host: required(`${prefix}_HOST`),
        port: optionalPort(`${prefix}_PORT`, 3306),
        user: required(`${prefix}_USER`),
        password: required(`${prefix}_PASSWORD`),
        database: required(`${prefix}_NAME`),
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
        charset: 'utf8mb4',
    });
};

export const closePool = async (pool: Pool) => {
    await pool.end();
};
