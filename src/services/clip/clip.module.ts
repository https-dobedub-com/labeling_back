import { Module } from '@nestjs/common';
import { ClipService } from './applications/clip.service';
import { ClipController } from './controllers/clip.controller';
import { ClipPerformanceRepository } from './repository/clip-performance.repository';
import { ClipRepository } from './repository/clip.repository';

@Module({
    controllers: [ClipController],
    providers: [ClipService, ClipRepository, ClipPerformanceRepository],
    exports: [ClipService, ClipRepository, ClipPerformanceRepository],
})
export class ClipModule {}
