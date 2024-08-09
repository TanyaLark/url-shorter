import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlRepository } from './url.repository';
import { CreateUrlDto } from './dtos/create-url.dto';
import { UsersRepository } from '../users/users.repository';
import { Url } from './url.entity';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { UUID } from '../common/types';

@Injectable()
export class UrlService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createUrl(payload: CreateUrlDto, userId: UUID): Promise<Url> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    return this.urlRepository.store(payload, user);
  }

  async findUrlsByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[Url[], number]> {
    const [urls, total] = await this.urlRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: (page - 1) * limit,
    });
    return [urls, total];
  }

  async findByUrlId(urlId: UUID): Promise<Url> {
    const url = await this.urlRepository.findOneBy({ id: urlId });
    if (!url) {
      throw new NotFoundException('URL not found.');
    }
    return url;
  }

  async findByCode(code: string): Promise<Url> {
    const url = await this.urlRepository.findOneBy({ code });
    if (!url) {
      throw new BadRequestException('URL not found.');
    }
    return url;
  }

  async updateUrl(urlId: UUID, payload: UpdateUrlDto): Promise<Url> {
    const url = await this.findByUrlId(urlId);
    const { originalUrl, alias, type, expiresAt } = payload;
    if (originalUrl) {
      url.originalUrl = originalUrl;
    }
    if (alias) {
      url.alias = alias;
    }
    if (type) {
      url.type = type;
    }
    if (expiresAt) {
      url.expiresAt = expiresAt;
    }
    return this.urlRepository.save(url);
  }
}
