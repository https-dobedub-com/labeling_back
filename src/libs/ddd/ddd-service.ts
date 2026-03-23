import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Context } from '@common/context';

export abstract class DddService {
    @InjectEntityManager()
    protected readonly entityManager!: EntityManager;

    @Inject()
    protected readonly context!: Context;

    @Inject()
    protected readonly eventEmitter!: EventEmitter2;
}
