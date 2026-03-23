import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LabelingTaskStatus } from '../../domain/labeling-task.entity';

export class ListLabelingTaskQueryDto {
    @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: '페이지 크기', default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ description: '제목 검색어' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: LabelingTaskStatus, description: '작업 상태' })
    @IsOptional()
    @IsEnum(LabelingTaskStatus)
    status?: LabelingTaskStatus;
}
