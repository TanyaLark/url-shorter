import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Url } from './url.entity';
import { CreateUrlDto } from './dtos/create-url.dto';
import { User } from '../users/user.entity';
import { Team } from '../team/team.entity';

export interface IUrlRepository {
  store(createUrlDto: CreateUrlDto, user: User, team: Team): Promise<Url>;
  getUrlByTeamId(teamId: string): Promise<Url[]>;
}

@Injectable()
export class UrlRepository extends Repository<Url> implements IUrlRepository {
  constructor(private dataSource: DataSource) {
    super(Url, dataSource.createEntityManager());
  }

  public async store(
    createUrlDto: CreateUrlDto,
    user: User,
    team: Team,
  ): Promise<Url> {
    const payload = { ...createUrlDto, user, team };
    const newUrl = this.create(payload);
    return this.save(newUrl);
  }

  public async getUrlByTeamId(teamId: string): Promise<Url[]> {
    const urls = await this.dataSource
      .createQueryBuilder(Url, 'url')
      .leftJoinAndSelect('url.team', 'team')
      .where('team.id = :teamId', { teamId })
      .getMany();
    return urls;
  }
}
