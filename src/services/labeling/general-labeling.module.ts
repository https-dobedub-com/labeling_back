import { Module } from '@nestjs/common';
import { GeneralLabelingController } from './controllers/general-labeling.controller';
import { GeneralLabelingService } from './applications/general-labeling.service';
import { LabelingTaskRepository } from './repository/labeling-task.repository';

@Module({
    controllers: [GeneralLabelingController],
    providers: [GeneralLabelingService, LabelingTaskRepository],
    exports: [GeneralLabelingService, LabelingTaskRepository],
})
export class GeneralLabelingModule {}
