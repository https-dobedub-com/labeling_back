import { PaginationDto } from '@common/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ClipQueryDto extends PaginationDto {

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    projectId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    characterId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    speakerId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    episodeId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sessionId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    roomId?: string;
}
