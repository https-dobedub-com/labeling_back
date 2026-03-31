import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ClipStatsQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    projectTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    characterName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    speakerName?: string;
}
