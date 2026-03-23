import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DddEventStatus {
    PENDING = 'pending',
    PROCESSED = 'processed',
    FAILED = 'failed',
}

@Entity('ddd_events')
@Index(['eventStatus', 'createdAt'])
export class DddEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    traceId!: string;

    @Column()
    eventType!: string;

    @Column({ type: 'text' })
    payload!: string;

    @Column({ type: 'varchar', default: DddEventStatus.PENDING })
    eventStatus!: DddEventStatus;

    @Column()
    occurredAt!: Date;

    @CreateDateColumn()
    readonly createdAt!: Date;

    @UpdateDateColumn()
    readonly updatedAt!: Date;

    constructor() {
        this.eventType = this.constructor.name;
        this.occurredAt = new Date();
    }

    static fromEvent(event: DddEvent) {
        const dddEvent = new DddEvent();
        const { occurredAt, eventType, ...payload } = event;
        dddEvent.eventType = event.constructor.name;
        dddEvent.payload = JSON.stringify(payload);
        return dddEvent;
    }

    setTraceId(traceId: string) {
        this.traceId = traceId;
    }
}
