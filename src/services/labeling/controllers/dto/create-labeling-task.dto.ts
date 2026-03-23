import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LabelingTaskStatus } from '../../domain/labeling-task.entity';

export class CreateLabelingTaskDto {
    @ApiProperty({ description: '작업명' })
    @IsString()
    title!: string;

    @ApiPropertyOptional({ description: '설명' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: '원본 언어', example: 'ko' })
    @IsOptional()
    @IsString()
    sourceLanguage?: string;

    @ApiPropertyOptional({ description: '목표 언어', example: 'en' })
    @IsOptional()
    @IsString()
    targetLanguage?: string;

    @ApiPropertyOptional({ description: '요청자' })
    @IsOptional()
    @IsString()
    requestedBy?: string;

    @ApiPropertyOptional({ enum: LabelingTaskStatus, description: '작업 상태' })
    @IsOptional()
    @IsEnum(LabelingTaskStatus)
    status?: LabelingTaskStatus;
}
