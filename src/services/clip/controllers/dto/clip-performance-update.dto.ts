import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClipPerformanceUpdateDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    primaryEmotion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    secondaryEmotion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    valence?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    arousal?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    speakingStyle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    deliveryIntent?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sceneContextShort?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    relationship?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    situationalTags?: unknown[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    utteranceType?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    nonverbalEvents?: unknown[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    prosodyTags?: unknown[];
}
