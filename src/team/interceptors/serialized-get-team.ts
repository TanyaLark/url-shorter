import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Team } from '../team.entity';
import { UUID } from '../../common/types';
import { SerializedUser } from '../../users/interceptors/serialized-user';

@Exclude()
export class SerializedGetTeam extends Team {
  @ApiProperty()
  @Expose()
  id: UUID;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  icon: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  // @ApiProperty()
  // @Expose()
  // urls: Url[];

  @ApiProperty({ type: [SerializedUser] })
  @Expose()
  users: SerializedUser[];

  constructor(partial: Partial<SerializedGetTeam>) {
    super();
    Object.assign(this, partial);
  }
}
