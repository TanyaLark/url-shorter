import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configurations } from './configs';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [...configurations],
      isGlobal: true,
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
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
  ],
})
export class ConfigsModule {}
