import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClipService } from '../applications/clip.service';
import { ClipPerformanceUpdateDto, ClipQueryDto } from './dto';

@ApiTags('clips')
@Controller('clips')
export class ClipController {
    constructor(private readonly clipService: ClipService) {}

    @Get()
    async list(@Query() query: ClipQueryDto) {
        // 1. Destructure body, params, query
        const { projectId, characterId, speakerId, episodeId, sessionId, roomId, ...options } = query;

        // 2. Get context

        // 3. Get result
        const data = await this.clipService.list(
            { projectId, characterId, speakerId, episodeId, sessionId, roomId },
            options
        );

        // 4. Send response
        return { data };
    }

    @Get(':id')
    async retrieve(@Param('id', ParseIntPipe) id: number) {
        // 1. Destructure body, params, query

        // 2. Get context

        // 3. Get result
        const data = await this.clipService.retrieve(id);

        // 4. Send response
        return { data };
    }

    @Put(':id/performance')
    async putPerformance(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ClipPerformanceUpdateDto
    ) {
        // 1. Destructure body, params, query

        // 2. Get context

        // 3. Get result
        const data = await this.clipService.putPerformance(id, body);

        // 4. Send response
        return { data };
    }
}
