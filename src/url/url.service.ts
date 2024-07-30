import { Injectable } from '@nestjs/common';
import { UrlRepository } from './url.repository';
import { CreateUrlDto } from './dtos/create-url.dto';
import { UsersRepository } from '../users/users.repository';
import { Url } from './url.entity';

@Injectable()
export class UrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUrl(payload: CreateUrlDto, userId: string): Promise<Url> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    return this.urlRepository.store(payload, user);
  }

  async findUrlByUserId() {
    const url = await this.urlRepository.find({
      relations: {
        user: true,
      },
    });
    return url;
  }
}
