import type { Pool } from 'mysql2/promise';

export type CursorValue = number | string | null;

export interface FetchSourceBatchArgs {
    sourcePool: Pool;
    cursor: CursorValue;
    batchSize: number;
}

export interface TransformRowArgs<SourceRow> {
    row: SourceRow;
    sourcePool: Pool;
    targetPool: Pool;
}

export interface WriteTargetBatchArgs<SourceRow, TargetRow> {
    sourceRows: SourceRow[];
    targetRows: TargetRow[];
    sourcePool: Pool;
    targetPool: Pool;
    dryRun: boolean;
}

export interface CopyTask<SourceRow, TargetRow> {
    name: string;
    description?: string;
    fetchSourceBatch(args: FetchSourceBatchArgs): Promise<SourceRow[]>;
    transformRow(args: TransformRowArgs<SourceRow>): Promise<TargetRow> | TargetRow;
    writeTargetBatch(args: WriteTargetBatchArgs<SourceRow, TargetRow>): Promise<number | void>;
    getNextCursor(rows: SourceRow[]): CursorValue;
}

export interface CliOptions {
    task?: string;
    dryRun: boolean;
    batchSize: number;
    limit?: number;
    cursor: CursorValue;
    help: boolean;
}
