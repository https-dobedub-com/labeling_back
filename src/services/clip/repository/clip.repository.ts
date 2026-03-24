import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PaginationOptions } from '@libs/utils';
import { DataSource } from 'typeorm';

type ClipFindConditions = {
    clipId?: number;
    projectId?: number;
    characterId?: string;
    speakerId?: number;
    episodeId?: string;
    sessionId?: string;
    roomId?: string;
};

export type ClipRow = {
    clipId: number;
    projectId: number | null;
    characterId: string | null;
    speakerId: number | null;
    episodeId: string | null;
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
                    clip_id AS clipId,
                    project_id AS projectId,
                    character_id AS characterId,
                    speaker_id AS speakerId,
                    episode_id AS episodeId,
                    script_text AS scriptText,
                    audio_path AS audioPath,
                    session_id AS sessionId,
                    mic_type AS micType,
                    room_id AS roomId,
                    distance_category AS distanceCategory,
                    sample_rate AS sampleRate,
                    bit_depth AS bitDepth,
                    channels AS channels,
                    duration_sec AS durationSec,
                    noise_level AS noiseLevel,
                    post_process AS postProcess,
                    created_at AS createdAt,
                    updated_at AS updatedAt
                FROM clip
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
                FROM clip
                ${whereClause}
            `,
            params
        )) as Array<{ total: number | string }>;

        return Number(result?.total ?? 0);
    }

    private buildWhereClause(conditions: ClipFindConditions) {
        const clauses: string[] = [];
        const params: Array<number | string> = [];

        if (conditions.clipId !== undefined) {
            clauses.push('clip_id = ?');
            params.push(conditions.clipId);
        }

        if (conditions.projectId !== undefined) {
            clauses.push('project_id = ?');
            params.push(conditions.projectId);
        }

        if (conditions.characterId) {
            clauses.push('character_id = ?');
            params.push(conditions.characterId);
        }

        if (conditions.speakerId !== undefined) {
            clauses.push('speaker_id = ?');
            params.push(conditions.speakerId);
        }

        if (conditions.episodeId) {
            clauses.push('episode_id = ?');
            params.push(conditions.episodeId);
        }

        if (conditions.sessionId) {
            clauses.push('session_id = ?');
            params.push(conditions.sessionId);
        }

        if (conditions.roomId) {
            clauses.push('room_id LIKE ?');
            params.push(`%${conditions.roomId}%`);
        }

        return {
            whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
            params,
        };
    }

    private getSortColumn(sort?: string) {
        const sortableColumns: Record<string, string> = {
            clipId: 'clip_id',
            projectId: 'project_id',
            characterId: 'character_id',
            speakerId: 'speaker_id',
            episodeId: 'episode_id',
            sessionId: 'session_id',
            roomId: 'room_id',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            durationSec: 'duration_sec',
        };

        return sortableColumns[sort ?? ''] ?? 'clip_id';
    }
}
