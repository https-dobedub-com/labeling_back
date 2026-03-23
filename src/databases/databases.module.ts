import { ConfigsService } from '@configs';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import entities from './entities';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigsService],
            useFactory: (configsService: ConfigsService) => ({
                ...configsService.database,
                entities,
            }),
        }),
    ],
})
export class DatabasesModule implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabasesModule.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    onModuleInit() {
        if (!this.dataSource.isInitialized) {
            throw new Error('Database is not initialized.');
        }

        this.logger.log(`Database is initialized (${this.dataSource.options.type}).`);
    }

    async onModuleDestroy() {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
            this.logger.log('Database is successfully destroyed.');
        }
    }
}
