import { Injectable } from '@nestjs/common';
import { UrlRepository } from './url.repository';
import { SerializedUrl } from './Interceptors/serialized-url';
import { CreateUrlDto } from './dtos/create-url.dto';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class UrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUrl(
    payload: CreateUrlDto,
    userId: string,
  ): Promise<SerializedUrl> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    const createdUrl = await this.urlRepository.store(payload, user);
    return new SerializedUrl(createdUrl);
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
