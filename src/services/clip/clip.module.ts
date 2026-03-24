import { Module } from '@nestjs/common';
import { ClipService } from './applications/clip.service';
import { ClipController } from './controllers/clip.controller';
import { ClipRepository } from './repository/clip.repository';

@Module({
    controllers: [ClipController],
    providers: [ClipService, ClipRepository],
    exports: [ClipService, ClipRepository],
})
export class ClipModule {}
