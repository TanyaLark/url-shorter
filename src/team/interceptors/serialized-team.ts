import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Team } from '../team.entity';
import { UUID } from '../../common/types';

@Exclude()
export class SerializedTeam extends Team {
  @ApiProperty()
  @Expose()
  id: UUID;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<SerializedTeam>) {
    super();
    Object.assign(this, partial);
  }
}
