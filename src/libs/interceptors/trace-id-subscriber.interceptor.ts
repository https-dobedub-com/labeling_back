import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Context, ContextKey } from '@common/context';
import { DddAggregate } from '@libs/ddd';

@Injectable()
@EventSubscriber()
export class TraceIdSubscriber implements EntitySubscriberInterface<DddAggregate> {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly context: Context
    ) {
        this.dataSource.subscribers.push(this);
    }

    listenTo() {
        return DddAggregate;
    }

    beforeInsert(event: InsertEvent<DddAggregate>) {
        const traceId = this.context.get<string>(ContextKey.TRACE_ID);

        if (traceId && event.entity) {
            event.entity['createdBy'] = traceId;
            event.entity['updatedBy'] = traceId;
        }
    }

    beforeUpdate(event: UpdateEvent<DddAggregate>) {
        const traceId = this.context.get<string>(ContextKey.TRACE_ID);

        if (traceId && event.entity) {
            event.entity['updatedBy'] = traceId;
        }
    }
}
