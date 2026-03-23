import { plainToInstance } from 'class-transformer';
import { isEqual } from 'lodash';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { stripUndefined } from '@libs/utils';
import { DddEvent } from './ddd-event';

@Entity()
export abstract class DddAggregate {
    private events: DddEvent[] = [];

    @CreateDateColumn()
    readonly createdAt!: Date;

    @Column({ select: false, nullable: true })
    private createdBy?: string;

    @UpdateDateColumn()
    readonly updatedAt!: Date;

    @Column({ select: false, nullable: true })
    private updatedBy?: string;

    @DeleteDateColumn()
    deletedAt!: Date | null;

    publishEvent(event: DddEvent) {
        this.events.push(event);
    }

    getPublishedEvents() {
        return [...this.events];
    }

    setTraceId(traceId: string) {
        if (!this.createdAt) {
            this.createdBy = traceId;
        }

        this.updatedBy = traceId;
    }

    protected stripUnchanged(changed: Record<string, any>) {
        const compared = Object.keys(changed).reduce((acc: Record<string, any>, prop) => {
            const originValue = this[prop as keyof typeof this];
            const changedValue = changed[prop];
            acc[prop] = !isEqual(originValue, changedValue) ? changedValue : undefined;
            return acc;
        }, {});

        return stripUndefined(compared);
    }

    toInstance<T>(dto: new (...args: any[]) => T) {
        return plainToInstance(dto, this);
    }
}
