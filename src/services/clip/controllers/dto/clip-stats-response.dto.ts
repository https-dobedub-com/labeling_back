import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ClipStatsResponseDto {
    @Expose()
    @ApiProperty()
    projectCount!: number;

    @Expose()
    @ApiProperty()
    characterCount!: number;

    @Expose()
    @ApiProperty()
    clipCount!: number;

    @Expose()
    @ApiProperty()
    completedCount!: number;

    @Expose()
    @ApiProperty()
    incompleteCount!: number;

    @Expose()
    @ApiProperty({
        description: '완료율(%)',
        example: 73.25,
    })
    completionRate!: number;
}
