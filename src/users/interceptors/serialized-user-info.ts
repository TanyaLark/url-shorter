import { Exclude, Expose } from 'class-transformer';
import { User, UserRole } from '../../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { SerializedUrl } from '../../url/interceptors/serialized-url';
import { SerializedTeam } from '../../team/interceptors/serialized-team';
import { Url } from '../../url/url.entity';

@Exclude()
export class SerializedUserInfo extends User {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  emailConfirmed: boolean;

  @ApiProperty({ enum: UserRole, examples: [UserRole.User, UserRole.Admin] })
  @Expose()
  role: UserRole;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: [SerializedUrl] })
  @Expose()
  urls: Url[];

  @ApiProperty({ type: [SerializedTeam] })
  @Expose()
  teams: SerializedTeam[];

  constructor(partial: Partial<SerializedUserInfo>) {
    super();
    Object.assign(this, partial);

    if (partial.urls) {
      this.urls = partial.urls.map((url) => new SerializedUrl(url));
    }

    if (partial.teams) {
      this.teams = partial.teams.map((team) => new SerializedTeam(team));
    }
  }
}
