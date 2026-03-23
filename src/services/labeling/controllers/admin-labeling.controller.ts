import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminLabelingService } from '../applications/admin-labeling.service';
import { CreateLabelingTaskDto, ListLabelingTaskQueryDto } from './dto';

@ApiTags('admin-labeling')
@Controller('admin/labeling-tasks')
export class AdminLabelingController {
    constructor(private readonly adminLabelingService: AdminLabelingService) {}

    @Get()
    async list(@Query() query: ListLabelingTaskQueryDto) {
        const data = await this.adminLabelingService.list(query);
        return { data };
    }

    @Post()
    async create(@Body() body: CreateLabelingTaskDto) {
        const data = await this.adminLabelingService.create(body);
        return { data };
    }
}
