import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PaginationOptions } from '@libs/utils';
import { DataSource } from 'typeorm';

type ClipFindConditions = {
    clipId?: number;
    projectTitle?: string;
    characterName?: string;
    speakerName?: string;
    episodeName?: string;
    sessionId?: string;
    roomId?: string;
};

export type ClipRow = {
    clipId: number;
    projectId: number | null;
    projectTitle: string | null;
    characterId: string | null;
    characterName: string | null;
    speakerId: number | null;
    speakerName: string | null;
    episodeId: string | null;
    episodeName: string | null;
    scriptText: string | null;
    audioPath: string | null;
    sessionId: string | null;
    micType: string | null;
    roomId: string | null;
    distanceCategory: string | null;
    sampleRate: number | null;
    bitDepth: number | null;
    channels: number | null;
    durationSec: number | null;
    noiseLevel: string | null;
    postProcess: string | null;
    createdAt: Date | string | null;
    updatedAt: Date | string | null;
};

export type ClipMetadataRow = {
    clipId: number;
    clipProjectId: number | null;
    clipCharacterId: string | null;
    clipCharacterName: string | null;
    clipSpeakerId: number | null;
    clipEpisodeId: string | null;
    clipEpisodeName: string | null;
    clipScriptText: string | null;
    clipAudioPath: string | null;
    clipSessionId: string | null;
    clipMicType: string | null;
    clipRoomId: string | null;
    clipDistanceCategory: string | null;
    clipSampleRate: number | null;
    clipBitDepth: number | null;
    clipChannels: number | null;
    clipDurationSec: number | null;
    clipNoiseLevel: string | null;
    clipPostProcess: string | null;
    clipCreatedAt: Date | string | null;
    clipUpdatedAt: Date | string | null;
    projectProjectId: number | null;
    projectTitleKo: string | null;
    projectTitleEn: string | null;
    projectGenre: string | null;
    projectSubGenre: string | null;
    projectRating: string | null;
    projectLanguage: string | null;
    projectIsLocalized: number | boolean | null;
    projectSourceLang: string | null;
    projectCreatedAt: Date | string | null;
    projectUpdatedAt: Date | string | null;
    characterCharacterId: string | null;
    characterCharacterName: string | null;
    characterProjectId: number | null;
    characterRoleName: string | null;
    characterGender: string | null;
    characterAgeGroup: string | null;
    characterPersonalityTags: string | null;
    characterRoleType: string | null;
    characterDialect: string | null;
    characterSpeechLevel: string | null;
    characterCreatedAt: Date | string | null;
    characterUpdatedAt: Date | string | null;
    speakerSpeakerId: number | null;
    speakerName: string | null;
    speakerGender: string | null;
    speakerLanguage: string | null;
    speakerCreatedAt: Date | string | null;
    speakerUpdatedAt: Date | string | null;
    licenseQcClipId: number | null;
    licenseQcContractId: string | null;
    licenseQcAllowedUsage: string | null;
    licenseQcAllowedRegion: string | null;
    licenseQcLicensePeriodStart: Date | string | null;
    licenseQcLicensePeriodEnd: Date | string | null;
    licenseQcSecondaryLicense: number | boolean | null;
    licenseQcConsentVersion: string | null;
    licenseQcConsentScope: string | null;
    licenseQcQcResult: string | null;
    licenseQcQcNotes: string | null;
    licenseQcAnnotatorId: string | null;
    licenseQcAnnotationTimestamp: Date | string | null;
    licenseQcCreatedAt: Date | string | null;
    licenseQcUpdatedAt: Date | string | null;
    performanceClipId: number | null;
    performancePrimaryEmotion: string | null;
    performanceSecondaryEmotion: string | null;
    performanceValence: number | null;
    performanceArousal: number | null;
    performanceSpeakingStyle: string | null;
    performanceDeliveryIntent: string | null;
    performanceSceneContextShort: string | null;
    performanceRelationship: string | null;
    performanceSituationalTags: string | null;
    performanceUtteranceType: string | null;
    performanceNonverbalEvents: string | null;
    performanceProsodyTags: string | null;
    performanceCreatedAt: Date | string | null;
    performanceUpdatedAt: Date | string | null;
};

@Injectable()
export class ClipRepository {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    async find(conditions: ClipFindConditions, options?: PaginationOptions) {
        const { whereClause, params } = this.buildWhereClause(conditions);
        const sortColumn = this.getSortColumn(options?.sort);
        const sortOrder = options?.order === 'ASC' ? 'ASC' : 'DESC';
        const limit = options?.limit ?? 20;
        const offset = ((options?.page ?? 1) - 1) * limit;

        return this.dataSource.query(
            `
                SELECT
                    c.clip_id AS clipId,
                    c.project_id AS projectId,
                    p.title_ko AS projectTitle,
                    c.character_id AS characterId,
                    ch.character_name AS characterName,
                    c.speaker_id AS speakerId,
                    s.name AS speakerName,
                    c.episode_id AS episodeId,
                    c.episode_name AS episodeName,
                    c.script_text AS scriptText,
                    c.audio_path AS audioPath,
                    c.session_id AS sessionId,
                    c.mic_type AS micType,
                    c.room_id AS roomId,
                    c.distance_category AS distanceCategory,
                    c.sample_rate AS sampleRate,
                    c.bit_depth AS bitDepth,
                    c.channels AS channels,
                    c.duration_sec AS durationSec,
                    c.noise_level AS noiseLevel,
                    c.post_process AS postProcess,
                    c.created_at AS createdAt,
                    c.updated_at AS updatedAt
                FROM clip c
                LEFT JOIN project p ON p.project_id = c.project_id
                LEFT JOIN \`character\` ch ON ch.character_id = c.character_id
                LEFT JOIN speaker s ON s.speaker_id = c.speaker_id
                ${whereClause}
                ORDER BY ${sortColumn} ${sortOrder}
                LIMIT ? OFFSET ?
            `,
            [...params, limit, offset]
        ) as Promise<ClipRow[]>;
    }

    async count(conditions: ClipFindConditions) {
        const { whereClause, params } = this.buildWhereClause(conditions);
        const [result] = (await this.dataSource.query(
            `
                SELECT COUNT(*) AS total
                FROM clip c
                LEFT JOIN project p ON p.project_id = c.project_id
                LEFT JOIN \`character\` ch ON ch.character_id = c.character_id
                LEFT JOIN speaker s ON s.speaker_id = c.speaker_id
                ${whereClause}
            `,
            params
        )) as Array<{ total: number | string }>;

        return Number(result?.total ?? 0);
    }

    async findMetadataById(clipId: number) {
        const [row] = (await this.dataSource.query(
            `
                SELECT
                    c.clip_id AS clipId,
                    c.project_id AS clipProjectId,
                    c.character_id AS clipCharacterId,
                    ch.character_name AS clipCharacterName,
                    c.speaker_id AS clipSpeakerId,
                    c.episode_id AS clipEpisodeId,
                    c.episode_name AS clipEpisodeName,
                    c.script_text AS clipScriptText,
                    c.audio_path AS clipAudioPath,
                    c.session_id AS clipSessionId,
                    c.mic_type AS clipMicType,
                    c.room_id AS clipRoomId,
                    c.distance_category AS clipDistanceCategory,
                    c.sample_rate AS clipSampleRate,
                    c.bit_depth AS clipBitDepth,
                    c.channels AS clipChannels,
                    c.duration_sec AS clipDurationSec,
                    c.noise_level AS clipNoiseLevel,
                    c.post_process AS clipPostProcess,
                    c.created_at AS clipCreatedAt,
                    c.updated_at AS clipUpdatedAt,

                    p.project_id AS projectProjectId,
                    p.title_ko AS projectTitleKo,
                    p.title_en AS projectTitleEn,
                    p.genre AS projectGenre,
                    p.sub_genre AS projectSubGenre,
                    p.rating AS projectRating,
                    p.language AS projectLanguage,
                    p.is_localized AS projectIsLocalized,
                    p.source_lang AS projectSourceLang,
                    p.created_at AS projectCreatedAt,
                    p.updated_at AS projectUpdatedAt,

                    ch.character_id AS characterCharacterId,
                    ch.character_name AS characterCharacterName,
                    ch.project_id AS characterProjectId,
                    ch.role_name AS characterRoleName,
                    ch.gender AS characterGender,
                    ch.age_group AS characterAgeGroup,
                    ch.personality_tags AS characterPersonalityTags,
                    ch.role_type AS characterRoleType,
                    ch.dialect AS characterDialect,
                    ch.speech_level AS characterSpeechLevel,
                    ch.created_at AS characterCreatedAt,
                    ch.updated_at AS characterUpdatedAt,

                    s.speaker_id AS speakerSpeakerId,
                    s.name AS speakerName,
                    s.gender AS speakerGender,
                    s.language AS speakerLanguage,
                    s.created_at AS speakerCreatedAt,
                    s.updated_at AS speakerUpdatedAt,

                    l.clip_id AS licenseQcClipId,
                    l.contract_id AS licenseQcContractId,
                    l.allowed_usage AS licenseQcAllowedUsage,
                    l.allowed_region AS licenseQcAllowedRegion,
                    l.license_period_start AS licenseQcLicensePeriodStart,
                    l.license_period_end AS licenseQcLicensePeriodEnd,
                    l.secondary_license AS licenseQcSecondaryLicense,
                    l.consent_version AS licenseQcConsentVersion,
                    l.consent_scope AS licenseQcConsentScope,
                    l.qc_result AS licenseQcQcResult,
                    l.qc_notes AS licenseQcQcNotes,
                    l.annotator_id AS licenseQcAnnotatorId,
                    l.annotation_timestamp AS licenseQcAnnotationTimestamp,
                    l.created_at AS licenseQcCreatedAt,
                    l.updated_at AS licenseQcUpdatedAt,

                    pf.clip_id AS performanceClipId,
                    pf.primary_emotion AS performancePrimaryEmotion,
                    pf.secondary_emotion AS performanceSecondaryEmotion,
                    pf.valence AS performanceValence,
                    pf.arousal AS performanceArousal,
                    pf.speaking_style AS performanceSpeakingStyle,
                    pf.delivery_intent AS performanceDeliveryIntent,
                    pf.scene_context_short AS performanceSceneContextShort,
                    pf.relationship AS performanceRelationship,
                    pf.situational_tags AS performanceSituationalTags,
                    pf.utterance_type AS performanceUtteranceType,
                    pf.nonverbal_events AS performanceNonverbalEvents,
                    pf.prosody_tags AS performanceProsodyTags,
                    pf.created_at AS performanceCreatedAt,
                    pf.updated_at AS performanceUpdatedAt
                FROM clip c
                LEFT JOIN project p ON p.project_id = c.project_id
                LEFT JOIN \`character\` ch ON ch.character_id = c.character_id
                LEFT JOIN speaker s ON s.speaker_id = c.speaker_id
                LEFT JOIN license_qc l ON l.clip_id = c.clip_id
                LEFT JOIN performance pf ON pf.clip_id = c.clip_id
                WHERE c.clip_id = ?
                LIMIT 1
            `,
            [clipId]
        )) as ClipMetadataRow[];

        return row ?? null;
    }

    private buildWhereClause(conditions: ClipFindConditions) {
        const clauses: string[] = [];
        const params: Array<number | string> = [];

        if (conditions.clipId !== undefined) {
            clauses.push('c.clip_id = ?');
            params.push(conditions.clipId);
        }

        if (conditions.projectTitle) {
            clauses.push('p.title_ko LIKE ?');
            params.push(`%${conditions.projectTitle}%`);
        }

        if (conditions.characterName) {
            clauses.push('ch.character_name LIKE ?');
            params.push(`%${conditions.characterName}%`);
        }

        if (conditions.speakerName) {
            clauses.push('s.name LIKE ?');
            params.push(`%${conditions.speakerName}%`);
        }

        if (conditions.episodeName) {
            clauses.push('c.episode_name LIKE ?');
            params.push(`%${conditions.episodeName}%`);
        }

        if (conditions.sessionId) {
            clauses.push('c.session_id = ?');
            params.push(conditions.sessionId);
        }

        if (conditions.roomId) {
            clauses.push('c.room_id LIKE ?');
            params.push(`%${conditions.roomId}%`);
        }

        return {
            whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
            params,
        };
    }

    private getSortColumn(sort?: string) {
        const sortableColumns: Record<string, string> = {
            clipId: 'c.clip_id',
            projectId: 'c.project_id',
            characterId: 'c.character_id',
            characterName: 'ch.character_name',
            speakerId: 'c.speaker_id',
            episodeId: 'c.episode_id',
            episodeName: 'c.episode_name',
            sessionId: 'c.session_id',
            roomId: 'c.room_id',
            createdAt: 'c.created_at',
            updatedAt: 'c.updated_at',
            durationSec: 'c.duration_sec',
        };

        return sortableColumns[sort ?? ''] ?? 'c.clip_id';
    }
}
