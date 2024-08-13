import { Module } from '@nestjs/common';
import { ConfigsModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UrlModule } from './url/url.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [ConfigsModule, AuthModule, UsersModule, UrlModule, TeamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
