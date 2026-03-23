import { Injectable } from '@nestjs/common';
import { DddService } from '@libs/ddd';
import { ListLabelingTaskQueryDto } from '../controllers/dto';
import { LabelingTaskRepository } from '../repository/labeling-task.repository';

@Injectable()
export class GeneralLabelingService extends DddService {
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

    async retrieve(id: string) {
        return this.labelingTaskRepository.findOneOrFail(id);
    }
}
