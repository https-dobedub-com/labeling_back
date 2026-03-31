import { PaginationDto } from '@common/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class ClipQueryDto extends PaginationDto {

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    clipId?: number;

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

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined) {
            return undefined;
        }
        if (value === true || value === 'true') {
            return true;
        }
        if (value === false || value === 'false') {
            return false;
        }
        return value;
    })
    @IsBoolean()
    unlabeledOnly?: boolean;
}
