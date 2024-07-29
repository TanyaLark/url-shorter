import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configurations } from './configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateConfig } from './config-validation';
import { join } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...configurations],
      isGlobal: true,
      validate: validateConfig,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB.host'),
        port: configService.get<number>('DB.port'),
        username: configService.get('DB.username'),
        password: configService.get('DB.password'),
        database: configService.get('DB.database'),
        entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
      }),
    }),
  ],
})
export class ConfigsModule {}
