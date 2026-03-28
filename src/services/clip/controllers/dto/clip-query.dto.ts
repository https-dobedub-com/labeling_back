import { PaginationDto } from '@common/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ClipQueryDto extends PaginationDto {

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    episodeName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sessionId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    roomId?: string;
}
