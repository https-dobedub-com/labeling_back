import { Module } from '@nestjs/common';
import { AdminLabelingController } from './controllers/admin-labeling.controller';
import { AdminLabelingService } from './applications/admin-labeling.service';
import { LabelingTaskRepository } from './repository/labeling-task.repository';

@Module({
    controllers: [AdminLabelingController],
    providers: [AdminLabelingService, LabelingTaskRepository],
    exports: [AdminLabelingService, LabelingTaskRepository],
})
export class AdminLabelingModule {}
