import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DddService } from '@libs/ddd';
import { PaginationOptions } from '@libs/utils';
import { ClipPerformanceUpdateDto, ClipMetadataResponseDto, ClipQueryDto, ClipStatsResponseDto } from '../controllers/dto';
import { ClipPerformanceRepository } from '../repository/clip-performance.repository';
import { ClipMetadataRow, ClipRepository, ClipStatsRow } from '../repository/clip.repository';

type ClipListConditions = Pick<
    ClipQueryDto,
    'projectTitle' | 'characterName' | 'speakerName' | 'episodeName' | 'sessionId' | 'roomId' | 'unlabeledOnly'
>;

type ClipStatsConditions = Pick<ClipQueryDto, 'projectTitle' | 'characterName' | 'speakerName'>;

const CONTENTS_RECORDS_BASE_URL = 'https://dubright-contents-v2.s3.ap-northeast-2.amazonaws.com/records';
const DUBRIGHTS_PATTERN_BASE_URL = 'https://dubright-pattern.s3.ap-northeast-2.amazonaws.com/dubrights/';

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
            items: items.map((item) => ({
                ...item,
                audioPath: this.resolveAudioPath(item.audioPath),
                hasPerformance: this.toBoolean(item.hasPerformance),
            })),
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

    async stats(conditions: ClipStatsConditions) {
        const stats = await this.clipRepository.getStats(conditions);

        return plainToInstance(
            ClipStatsResponseDto,
            this.toStatsResponse(stats),
            { excludeExtraneousValues: true }
        );
    }

    private toMetadataResponse(row: ClipMetadataRow) {
        return {
            clip: {
                clipId: row.clipId,
                projectId: row.clipProjectId,
                characterId: row.clipCharacterId,
                characterName: row.clipCharacterName,
                speakerId: row.clipSpeakerId,
                episodeId: row.clipEpisodeId,
                episodeName: row.clipEpisodeName,
                scriptText: row.clipScriptText,
                audioPath: this.resolveAudioPath(row.clipAudioPath),
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
                          characterName: row.characterCharacterName,
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

    private toStatsResponse(row: ClipStatsRow | null) {
        const projectCount = Number(row?.projectCount ?? 0);
        const characterCount = Number(row?.characterCount ?? 0);
        const clipCount = Number(row?.clipCount ?? 0);
        const completedCount = Number(row?.completedCount ?? 0);
        const incompleteCount = Number(row?.incompleteCount ?? 0);
        const completionRate = clipCount > 0 ? Number(((completedCount / clipCount) * 100).toFixed(2)) : 0;

        return {
            projectCount,
            characterCount,
            clipCount,
            completedCount,
            incompleteCount,
            completionRate,
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

    private resolveAudioPath(audioPath: string | null) {
        if (!audioPath) {
            return audioPath;
        }

        if (/^https?:\/\//.test(audioPath)) {
            return audioPath;
        }

        if (/^\/[0-9]{4}-[0-9]{2}\/[^/]+$/.test(audioPath)) {
            return `${CONTENTS_RECORDS_BASE_URL}${audioPath}`;
        }

        if (/^(webtoon\/[0-9]+\/round\/[0-9]+\/)?recordings?\/[^/]+$/.test(audioPath)) {
            return `${DUBRIGHTS_PATTERN_BASE_URL}${audioPath}`;
        }

        return audioPath;
    }
}
