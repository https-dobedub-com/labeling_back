import { Injectable, NotFoundException } from '@nestjs/common';
import { DddRepository } from '@libs/ddd';
import { convertOptions, type PaginationOptions } from '@libs/utils';
import { LabelingTask, LabelingTaskStatus } from '../domain/labeling-task.entity';

@Injectable()
export class LabelingTaskRepository extends DddRepository<LabelingTask> {
    entityClass = LabelingTask;

    async find(
        conditions: {
            id?: string;
            search?: string;
            status?: LabelingTaskStatus;
        },
        options?: PaginationOptions
    ) {
        const queryBuilder = this.createQueryBuilder('labelingTask');

        if (conditions.id) {
            queryBuilder.andWhere('labelingTask.id = :id', { id: conditions.id });
        }

        if (conditions.status) {
            queryBuilder.andWhere('labelingTask.status = :status', { status: conditions.status });
        }

        if (conditions.search) {
            queryBuilder.andWhere('labelingTask.title LIKE :search', { search: `%${conditions.search}%` });
        }

        queryBuilder.orderBy(`labelingTask.${options?.sort ?? 'createdAt'}`, options?.order ?? 'DESC');

        const { skip, take } = convertOptions(options);

        if (skip !== undefined) {
            queryBuilder.skip(skip);
        }

        if (take !== undefined) {
            queryBuilder.take(take);
        }

        return queryBuilder.getMany();
    }

    async count(conditions: { search?: string; status?: LabelingTaskStatus }) {
        const queryBuilder = this.createQueryBuilder('labelingTask');

        if (conditions.status) {
            queryBuilder.andWhere('labelingTask.status = :status', { status: conditions.status });
        }

        if (conditions.search) {
            queryBuilder.andWhere('labelingTask.title LIKE :search', { search: `%${conditions.search}%` });
        }

        return queryBuilder.getCount();
    }

    async findOneOrFail(id: string) {
        const [task] = await this.find({ id });

        if (!task) {
            throw new NotFoundException('라벨링 작업을 찾을 수 없습니다.');
        }

        return task;
    }
}
