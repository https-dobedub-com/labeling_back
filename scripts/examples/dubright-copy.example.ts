import type { RowDataPacket } from 'mysql2/promise';
import type { CopyTask } from '../lib/types';

type ExampleSourceRow = RowDataPacket & {
    id: number;
    title: string | null;
    createdAt: string | null;
};

type ExampleTargetRow = {
    sourceId: number;
    title: string | null;
    createdAt: string | null;
};

const task: CopyTask<ExampleSourceRow, ExampleTargetRow> = {
    name: 'dubright-copy-example',
    description: 'Copy this file and replace table names / mappings before running.',

    async fetchSourceBatch({ sourcePool, cursor, batchSize }) {
        const numericCursor = typeof cursor === 'number' ? cursor : 0;

        const [rows] = await sourcePool.query<ExampleSourceRow[]>(
            `
                SELECT
                    id,
                    title,
                    created_at AS createdAt
                FROM some_source_table
                WHERE id > ?
                ORDER BY id ASC
                LIMIT ?
            `,
            [numericCursor, batchSize]
        );

        return rows;
    },

    async transformRow({ row }) {
        return {
            sourceId: row.id,
            title: row.title,
            createdAt: row.createdAt,
        };
    },

    async writeTargetBatch({ targetPool, targetRows }) {
        if (targetRows.length === 0) {
            return 0;
        }

        const placeholders = targetRows.map(() => '(?, ?, ?)').join(', ');
        const values = targetRows.flatMap((row) => [row.sourceId, row.title, row.createdAt]);

        await targetPool.query(
            `
                INSERT INTO some_target_table (
                    source_id,
                    title,
                    created_at
                ) VALUES ${placeholders}
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    created_at = VALUES(created_at)
            `,
            values
        );

        return targetRows.length;
    },

    getNextCursor(rows) {
        return rows[rows.length - 1]?.id ?? null;
    },
};

export default task;
