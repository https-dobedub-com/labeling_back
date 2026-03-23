import { Injectable } from '@nestjs/common';
import { DddService } from '@libs/ddd';
import { CreateLabelingTaskDto, ListLabelingTaskQueryDto } from '../controllers/dto';
import { LabelingTask, LabelingTaskStatus } from '../domain/labeling-task.entity';
import { LabelingTaskRepository } from '../repository/labeling-task.repository';

@Injectable()
export class AdminLabelingService extends DddService {
    constructor(private readonly labelingTaskRepository: LabelingTaskRepository) {
        super();
    }

    async list(query: ListLabelingTaskQueryDto) {
        const [items, total] = await Promise.all([
            this.labelingTaskRepository.find(
                {
                    search: query.search,
                    status: query.status,
                },
                {
                    page: query.page,
                    limit: query.limit,
                    order: 'DESC',
                }
            ),
            this.labelingTaskRepository.count({
                search: query.search,
                status: query.status,
            }),
        ]);

        return {
            items,
            total,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        };
    }

    async create(body: CreateLabelingTaskDto) {
        const task = new LabelingTask({
            title: body.title,
            description: body.description,
            sourceLanguage: body.sourceLanguage,
            targetLanguage: body.targetLanguage,
            requestedBy: body.requestedBy,
            status: body.status ?? LabelingTaskStatus.PENDING,
        });

        await this.labelingTaskRepository.save([task]);
        return task;
    }
}
