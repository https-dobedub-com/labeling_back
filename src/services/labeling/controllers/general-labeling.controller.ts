import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeneralLabelingService } from '../applications/general-labeling.service';
import { ListLabelingTaskQueryDto } from './dto';

@ApiTags('labeling')
@Controller('labeling-tasks')
export class GeneralLabelingController {
    constructor(private readonly generalLabelingService: GeneralLabelingService) {}

    @Get()
    async list(@Query() query: ListLabelingTaskQueryDto) {
        const data = await this.generalLabelingService.list(query);
        return { data };
    }

    @Get(':id')
    async retrieve(@Param('id') id: string) {
        const data = await this.generalLabelingService.retrieve(id);
        return { data };
    }
}
