import fs from 'fs';
import path from 'path';
import type { Pool } from 'mysql2/promise';
import { closePool, createPoolFromEnv } from './lib/db';
import { logError, logInfo, logWarn } from './lib/logger';
import type { CliOptions, CopyTask, CursorValue } from './lib/types';

const printHelp = () => {
    console.log(`
Usage:
  npm run copy:dubright -- --task ./scripts/examples/dubright-copy.example.ts [options]

Options:
  --task <path>        Task module path
  --dry-run            Fetch/transform only, do not write target DB
  --batch-size <n>     Batch size (default: 500)
  --limit <n>          Stop after n source rows
  --cursor <value>     Start cursor value
  --help               Show help

Required env:
  SOURCE_DB_HOST, SOURCE_DB_PORT, SOURCE_DB_USER, SOURCE_DB_PASSWORD, SOURCE_DB_NAME
  TARGET_DB_HOST, TARGET_DB_PORT, TARGET_DB_USER, TARGET_DB_PASSWORD, TARGET_DB_NAME
`);
};

const parseArgs = (argv: string[]): CliOptions => {
    const options: CliOptions = {
        dryRun: false,
        batchSize: 500,
        cursor: null,
        help: false,
    };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        if (arg === '--help') {
            options.help = true;
            continue;
        }

        if (arg === '--dry-run') {
            options.dryRun = true;
            continue;
        }

        if (arg === '--task') {
            options.task = argv[i + 1];
            i += 1;
            continue;
        }

        if (arg === '--batch-size') {
            options.batchSize = Number(argv[i + 1] ?? '500');
            i += 1;
            continue;
        }

        if (arg === '--limit') {
            options.limit = Number(argv[i + 1] ?? '0');
            i += 1;
            continue;
        }

        if (arg === '--cursor') {
            const raw = argv[i + 1];

            if (raw !== undefined) {
                const numeric = Number(raw);
                options.cursor = Number.isFinite(numeric) && raw.trim() !== '' ? numeric : raw;
            }

            i += 1;
        }
    }

    return options;
};

const loadTask = <SourceRow, TargetRow>(taskPath: string): CopyTask<SourceRow, TargetRow> => {
    const resolvedPath = path.resolve(process.cwd(), taskPath);

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Task file not found: ${resolvedPath}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const imported = require(resolvedPath);
    const task = (imported.default ?? imported.task ?? imported) as CopyTask<SourceRow, TargetRow>;

    if (!task?.name || !task?.fetchSourceBatch || !task?.transformRow || !task?.writeTargetBatch || !task?.getNextCursor) {
        throw new Error(`Invalid task module: ${resolvedPath}`);
    }

    return task;
};

const executeTask = async <SourceRow, TargetRow>(
    task: CopyTask<SourceRow, TargetRow>,
    options: CliOptions,
    sourcePool: Pool,
    targetPool: Pool
) => {
    let cursor: CursorValue = options.cursor;
    let processed = 0;
    let written = 0;
    let batch = 0;

    for (;;) {
        const remaining = options.limit !== undefined ? options.limit - processed : undefined;

        if (remaining !== undefined && remaining <= 0) {
            break;
        }

        const currentBatchSize = remaining !== undefined ? Math.min(options.batchSize, remaining) : options.batchSize;
        const sourceRows = await task.fetchSourceBatch({
            sourcePool,
            cursor,
            batchSize: currentBatchSize,
        });

        if (sourceRows.length === 0) {
            break;
        }

        const targetRows: TargetRow[] = [];

        for (const row of sourceRows) {
            // eslint-disable-next-line no-await-in-loop
            const transformed = await task.transformRow({ row, sourcePool, targetPool });
            targetRows.push(transformed);
        }

        batch += 1;
        processed += sourceRows.length;

        if (options.dryRun) {
            written += targetRows.length;
            logInfo(`[dry-run] batch=${batch} fetched=${sourceRows.length} cursor=${String(cursor)}`);

            if (batch === 1) {
                logInfo('[dry-run] sample target row', targetRows[0] ?? null);
            }
        } else {
            const result = await task.writeTargetBatch({
                sourceRows,
                targetRows,
                sourcePool,
                targetPool,
                dryRun: false,
            });
            written += typeof result === 'number' ? result : targetRows.length;
            logInfo(`batch=${batch} fetched=${sourceRows.length} written=${written}`);
        }

        cursor = task.getNextCursor(sourceRows);

        if (sourceRows.length < currentBatchSize) {
            break;
        }
    }

    return { processed, written, lastCursor: cursor, batches: batch };
};

const main = async () => {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
        printHelp();
        return;
    }

    if (!options.task) {
        printHelp();
        throw new Error('Missing required option: --task');
    }

    const task = loadTask(options.task);
    const sourcePool = createPoolFromEnv('SOURCE_DB');
    const targetPool = createPoolFromEnv('TARGET_DB');

    try {
        logInfo(`task=${task.name}`);
        if (task.description) {
            logInfo(task.description);
        }

        if (options.dryRun) {
            logWarn('Running in dry-run mode. No writes will be executed.');
        }

        const result = await executeTask(task, options, sourcePool, targetPool);
        logInfo('completed', result);
    } finally {
        await Promise.all([closePool(sourcePool), closePool(targetPool)]);
    }
};

main().catch((error) => {
    logError('copy script failed', error instanceof Error ? error.stack ?? error.message : error);
    process.exitCode = 1;
});
