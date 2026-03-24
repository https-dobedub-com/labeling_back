import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DddService } from '@libs/ddd';
import { PaginationOptions } from '@libs/utils';
import { ClipPerformanceUpdateDto, ClipMetadataResponseDto, ClipQueryDto } from '../controllers/dto';
import { ClipPerformanceRepository } from '../repository/clip-performance.repository';
import { ClipMetadataRow, ClipRepository } from '../repository/clip.repository';

type ClipListConditions = Pick<
    ClipQueryDto,
    'projectId' | 'characterId' | 'speakerId' | 'episodeId' | 'sessionId' | 'roomId'
>;

@Injectable()
export class ClipService extends DddService {
    constructor(
        private readonly clipRepository: ClipRepository,
        private readonly clipPerformanceRepository: ClipPerformanceRepository
    ) {
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
        const metadata = await this.clipRepository.findMetadataById(id);

        if (!metadata) {
            throw new NotFoundException('clip을 찾을 수 없습니다.');
        }

        return plainToInstance(ClipMetadataResponseDto, this.toMetadataResponse(metadata), {
            excludeExtraneousValues: true,
        });
    }

    async putPerformance(id: number, payload: ClipPerformanceUpdateDto) {
        const [clip] = await this.clipRepository.find({ clipId: id });

        if (!clip) {
            throw new NotFoundException('clip을 찾을 수 없습니다.');
        }

        await this.clipPerformanceRepository.put(id, payload);
        return this.retrieve(id);
    }

    private toMetadataResponse(row: ClipMetadataRow) {
        return {
            clip: {
                clipId: row.clipId,
                projectId: row.clipProjectId,
                characterId: row.clipCharacterId,
                speakerId: row.clipSpeakerId,
                episodeId: row.clipEpisodeId,
                scriptText: row.clipScriptText,
                audioPath: row.clipAudioPath,
                sessionId: row.clipSessionId,
                micType: row.clipMicType,
                roomId: row.clipRoomId,
                distanceCategory: row.clipDistanceCategory,
                sampleRate: row.clipSampleRate,
                bitDepth: row.clipBitDepth,
                channels: row.clipChannels,
                durationSec: row.clipDurationSec,
                noiseLevel: row.clipNoiseLevel,
                postProcess: row.clipPostProcess,
                createdAt: row.clipCreatedAt,
                updatedAt: row.clipUpdatedAt,
            },
            project:
                row.projectProjectId === null
                    ? null
                    : {
                          projectId: row.projectProjectId,
                          titleKo: row.projectTitleKo,
                          titleEn: row.projectTitleEn,
                          genre: row.projectGenre,
                          subGenre: row.projectSubGenre,
                          rating: row.projectRating,
                          language: row.projectLanguage,
                          isLocalized: this.toBoolean(row.projectIsLocalized),
                          sourceLang: row.projectSourceLang,
                          createdAt: row.projectCreatedAt,
                          updatedAt: row.projectUpdatedAt,
                      },
            character:
                row.characterCharacterId === null
                    ? null
                    : {
                          characterId: row.characterCharacterId,
                          projectId: row.characterProjectId,
                          roleName: row.characterRoleName,
                          gender: row.characterGender,
                          ageGroup: row.characterAgeGroup,
                          personalityTags: this.parseJson(row.characterPersonalityTags),
                          roleType: row.characterRoleType,
                          dialect: row.characterDialect,
                          speechLevel: row.characterSpeechLevel,
                          createdAt: row.characterCreatedAt,
                          updatedAt: row.characterUpdatedAt,
                      },
            speaker:
                row.speakerSpeakerId === null
                    ? null
                    : {
                          speakerId: row.speakerSpeakerId,
                          name: row.speakerName,
                          gender: row.speakerGender,
                          language: row.speakerLanguage,
                          createdAt: row.speakerCreatedAt,
                          updatedAt: row.speakerUpdatedAt,
                      },
            licenseQc:
                row.licenseQcClipId === null
                    ? null
                    : {
                          clipId: row.licenseQcClipId,
                          contractId: row.licenseQcContractId,
                          allowedUsage: this.parseJson(row.licenseQcAllowedUsage),
                          allowedRegion: row.licenseQcAllowedRegion,
                          licensePeriodStart: row.licenseQcLicensePeriodStart,
                          licensePeriodEnd: row.licenseQcLicensePeriodEnd,
                          secondaryLicense: this.toBoolean(row.licenseQcSecondaryLicense),
                          consentVersion: row.licenseQcConsentVersion,
                          consentScope: row.licenseQcConsentScope,
                          qcResult: row.licenseQcQcResult,
                          qcNotes: row.licenseQcQcNotes,
                          annotatorId: row.licenseQcAnnotatorId,
                          annotationTimestamp: row.licenseQcAnnotationTimestamp,
                          createdAt: row.licenseQcCreatedAt,
                          updatedAt: row.licenseQcUpdatedAt,
                      },
            performance:
                row.performanceClipId === null
                    ? null
                    : {
                          clipId: row.performanceClipId,
                          primaryEmotion: row.performancePrimaryEmotion,
                          secondaryEmotion: row.performanceSecondaryEmotion,
                          valence: row.performanceValence,
                          arousal: row.performanceArousal,
                          speakingStyle: row.performanceSpeakingStyle,
                          deliveryIntent: row.performanceDeliveryIntent,
                          sceneContextShort: row.performanceSceneContextShort,
                          relationship: row.performanceRelationship,
                          situationalTags: this.parseJson(row.performanceSituationalTags),
                          utteranceType: row.performanceUtteranceType,
                          nonverbalEvents: this.parseJson(row.performanceNonverbalEvents),
                          prosodyTags: this.parseJson(row.performanceProsodyTags),
                          createdAt: row.performanceCreatedAt,
                          updatedAt: row.performanceUpdatedAt,
                      },
        };
    }

    private parseJson(value: string | null) {
        if (!value) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    private toBoolean(value: number | boolean | null) {
        if (value === null) {
            return null;
        }

        return Boolean(value);
    }
}
