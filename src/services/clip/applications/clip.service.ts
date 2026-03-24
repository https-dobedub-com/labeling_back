import { Injectable, NotFoundException } from '@nestjs/common';
import { DddService } from '@libs/ddd';
import { PaginationOptions } from '@libs/utils';
import { ClipRepository } from '../repository/clip.repository';
import { ClipQueryDto } from '../controllers/dto';

type ClipListConditions = Pick<
    ClipQueryDto,
    'projectId' | 'characterId' | 'speakerId' | 'episodeId' | 'sessionId' | 'roomId'
>;

@Injectable()
export class ClipService extends DddService {
    constructor(private readonly clipRepository: ClipRepository) {
        super();
    }

    async list(conditions: ClipListConditions, options?: PaginationOptions) {
        const [items, total] = await Promise.all([
            this.clipRepository.find(conditions, options),
            this.clipRepository.count(conditions),
        ]);

        return {
            items,
            total,
            page: options?.page ?? 1,
            limit: options?.limit ?? 20,
        };
    }

    async retrieve(id: number) {
        const [clip] = await this.clipRepository.find({ clipId: id });

        if (!clip) {
            throw new NotFoundException('clip을 찾을 수 없습니다.');
        }

        return clip;
    }
}
