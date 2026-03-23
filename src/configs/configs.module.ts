import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ConfigsService } from './configs.service';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`],
            load: [configuration],
        }),
    ],
    providers: [ConfigsService],
    exports: [ConfigsService],
})
export class ConfigsModule {}
