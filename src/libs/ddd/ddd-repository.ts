import { Context, ContextKey } from '@common/context';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, ObjectType } from 'typeorm';
import { DddAggregate } from './ddd-aggregate';
import { DddEvent } from './ddd-event';

export abstract class DddRepository<T extends DddAggregate> {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly context: Context
    ) {}

    abstract entityClass: ObjectType<T>;

    get entityManager(): EntityManager {
        return this.context.get<EntityManager>(ContextKey.ENTITY_MANAGER) || this.dataSource.manager;
    }

    createQueryBuilder(alias: string) {
        return this.entityManager.createQueryBuilder<T>(this.entityClass, alias);
    }

    async save(entities: T[]) {
        await this.saveEntities(entities);
        await this.saveEvents(entities.flatMap((entity) => entity.getPublishedEvents()));
    }

    async softRemove(entities: T[]) {
        await this.entityManager.softRemove(entities);
    }

    private async saveEntities(entities: T[]) {
        const traceId = this.context.get<string>(ContextKey.TRACE_ID) ?? 'system';
        entities.forEach((entity) => entity.setTraceId(traceId));
        await this.entityManager.save(entities);
    }

    private async saveEvents(events: DddEvent[]) {
        if (events.length === 0) {
            return;
        }

        const traceId = this.context.get<string>(ContextKey.TRACE_ID) ?? 'system';
        const dddEvents = events.map((event) => DddEvent.fromEvent(event));
        dddEvents.forEach((event) => event.setTraceId(traceId));

        await this.entityManager.save(dddEvents);

        const currentDddEvents = this.context.get<DddEvent[]>(ContextKey.DDD_EVENTS) || [];
        currentDddEvents.push(...dddEvents);
        this.context.set(ContextKey.DDD_EVENTS, currentDddEvents);
    }
}
