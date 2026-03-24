import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ClipPerformanceUpdateDto } from '../controllers/dto';

@Injectable()
export class ClipPerformanceRepository {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    async put(clipId: number, payload: ClipPerformanceUpdateDto) {
        const values = [
            clipId,
            payload.primaryEmotion ?? null,
            payload.secondaryEmotion ?? null,
            payload.valence === undefined ? null : payload.valence,
            payload.arousal === undefined ? null : payload.arousal,
            payload.speakingStyle ?? null,
            payload.deliveryIntent ?? null,
            payload.sceneContextShort ?? null,
            payload.relationship ?? null,
            this.stringifyJson(payload.situationalTags),
            payload.utteranceType ?? null,
            this.stringifyJson(payload.nonverbalEvents),
            this.stringifyJson(payload.prosodyTags),
        ];

        await this.dataSource.query(
            `
                INSERT INTO performance (
                    clip_id,
                    primary_emotion,
                    secondary_emotion,
                    valence,
                    arousal,
                    speaking_style,
                    delivery_intent,
                    scene_context_short,
                    relationship,
                    situational_tags,
                    utterance_type,
                    nonverbal_events,
                    prosody_tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    primary_emotion = VALUES(primary_emotion),
                    secondary_emotion = VALUES(secondary_emotion),
                    valence = VALUES(valence),
                    arousal = VALUES(arousal),
                    speaking_style = VALUES(speaking_style),
                    delivery_intent = VALUES(delivery_intent),
                    scene_context_short = VALUES(scene_context_short),
                    relationship = VALUES(relationship),
                    situational_tags = VALUES(situational_tags),
                    utterance_type = VALUES(utterance_type),
                    nonverbal_events = VALUES(nonverbal_events),
                    prosody_tags = VALUES(prosody_tags)
            `,
            values
        );
    }

    private stringifyJson(value: unknown[] | undefined) {
        if (value === undefined) {
            return null;
        }

        return JSON.stringify(value);
    }
}
