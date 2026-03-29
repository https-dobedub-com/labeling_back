import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class ClipDetailDto {
    @Expose()
    @ApiProperty()
    clipId!: number;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    projectId!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    characterId!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    characterName!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    speakerId!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    episodeId!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    episodeName!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    scriptText!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    audioPath!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    sessionId!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    micType!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    roomId!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    distanceCategory!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    sampleRate!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    bitDepth!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    channels!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    durationSec!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    noiseLevel!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    postProcess!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    createdAt!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    updatedAt!: Date | string | null;
}

@Exclude()
class ProjectDetailDto {
    @Expose()
    @ApiProperty()
    projectId!: number;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    titleKo!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    titleEn!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    genre!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    subGenre!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    rating!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    language!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    isLocalized!: boolean | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    sourceLang!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    createdAt!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    updatedAt!: Date | string | null;
}

@Exclude()
class CharacterDetailDto {
    @Expose()
    @ApiProperty()
    characterId!: string;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    characterName!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    projectId!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    roleName!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    gender!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    ageGroup!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    personalityTags!: unknown;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    roleType!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    dialect!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    speechLevel!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    createdAt!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    updatedAt!: Date | string | null;
}

@Exclude()
class SpeakerDetailDto {
    @Expose()
    @ApiProperty()
    speakerId!: number;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    name!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    gender!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    language!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    createdAt!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    updatedAt!: Date | string | null;
}

@Exclude()
class LicenseQcDetailDto {
    @Expose()
    @ApiProperty()
    clipId!: number;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    contractId!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    allowedUsage!: unknown;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    allowedRegion!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    licensePeriodStart!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    licensePeriodEnd!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    secondaryLicense!: boolean | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    consentVersion!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    consentScope!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    qcResult!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    qcNotes!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    annotatorId!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    annotationTimestamp!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    createdAt!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    updatedAt!: Date | string | null;
}

@Exclude()
class PerformanceDetailDto {
    @Expose()
    @ApiProperty()
    clipId!: number;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    primaryEmotion!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    secondaryEmotion!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    valence!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    arousal!: number | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    speakingStyle!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    deliveryIntent!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    sceneContextShort!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    relationship!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    situationalTags!: unknown;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    utteranceType!: string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    nonverbalEvents!: unknown;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    prosodyTags!: unknown;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    createdAt!: Date | string | null;

    @Expose()
    @ApiPropertyOptional({ nullable: true })
    updatedAt!: Date | string | null;
}

@Exclude()
export class ClipMetadataResponseDto {
    @Expose()
    @ApiProperty({ type: ClipDetailDto })
    @Type(() => ClipDetailDto)
    clip!: ClipDetailDto;

    @Expose()
    @ApiPropertyOptional({ type: ProjectDetailDto, nullable: true })
    @Type(() => ProjectDetailDto)
    project!: ProjectDetailDto | null;

    @Expose()
    @ApiPropertyOptional({ type: CharacterDetailDto, nullable: true })
    @Type(() => CharacterDetailDto)
    character!: CharacterDetailDto | null;

    @Expose()
    @ApiPropertyOptional({ type: SpeakerDetailDto, nullable: true })
    @Type(() => SpeakerDetailDto)
    speaker!: SpeakerDetailDto | null;

    @Expose()
    @ApiPropertyOptional({ type: LicenseQcDetailDto, nullable: true })
    @Type(() => LicenseQcDetailDto)
    licenseQc!: LicenseQcDetailDto | null;

    @Expose()
    @ApiPropertyOptional({ type: PerformanceDetailDto, nullable: true })
    @Type(() => PerformanceDetailDto)
    performance!: PerformanceDetailDto | null;
}
