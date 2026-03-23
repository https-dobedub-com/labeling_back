import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DddAggregate } from '@libs/ddd';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum LabelingTaskStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}

type Ctor = {
    title: string;
    description?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    requestedBy?: string;
    status: LabelingTaskStatus;
};

@Entity('labeling_tasks')
@Index(['status', 'createdAt'])
export class LabelingTask extends DddAggregate {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column({ comment: '작업명' })
    title!: string;

    @ApiPropertyOptional()
    @Column({ comment: '작업 설명', type: 'text', nullable: true })
    description?: string | null;

    @ApiPropertyOptional()
    @Column({ comment: '원본 언어', nullable: true })
    sourceLanguage?: string | null;

    @ApiPropertyOptional()
    @Column({ comment: '목표 언어', nullable: true })
    targetLanguage?: string | null;

    @ApiPropertyOptional()
    @Column({ comment: '요청자', nullable: true })
    requestedBy?: string | null;

    @ApiProperty({ enum: LabelingTaskStatus })
    @Column({ comment: '작업 상태', type: 'varchar', default: LabelingTaskStatus.PENDING })
    status!: LabelingTaskStatus;

    constructor(args?: Ctor) {
        super();

        if (args) {
            this.title = args.title;
            this.description = args.description ?? null;
            this.sourceLanguage = args.sourceLanguage ?? null;
            this.targetLanguage = args.targetLanguage ?? null;
            this.requestedBy = args.requestedBy ?? null;
            this.status = args.status;
        }
    }

    update(args: Partial<Ctor>) {
        const changedArgs = this.stripUnchanged(args);

        if (!changedArgs) {
            return;
        }

        Object.assign(this, changedArgs);
    }
}
