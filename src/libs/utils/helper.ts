import { customAlphabet } from 'nanoid';
import type { FindOptionsWhere } from 'typeorm';

type NonFunction<T> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

type StrippableWhere<T> = {
    [K in keyof FindOptionsWhere<NonFunction<T>>]?: FindOptionsWhere<NonFunction<T>>[K] | undefined;
};

type StrictFindOptionsWhere<T> = FindOptionsWhere<T>;

export function stripUndefined<T>(obj: StrippableWhere<T>): StrictFindOptionsWhere<T> {
    const stripped = Object.keys(obj).reduce((acc: any, prop) => {
        if (obj[prop] !== undefined) {
            acc[prop] = obj[prop];
        }

        return acc;
    }, {});

    if (Object.keys(stripped).length === 0) {
        return {} as StrictFindOptionsWhere<T>;
    }

    return stripped as StrictFindOptionsWhere<T>;
}

export function randomId() {
    return customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10)();
}
