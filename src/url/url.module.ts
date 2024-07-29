import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';
import { UsersRepository } from '../users/users.repository';

@Module({
  controllers: [UrlController],
  providers: [UrlService, UrlRepository, UsersRepository],
})
export class UrlModule {}
