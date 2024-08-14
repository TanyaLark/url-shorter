import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Team } from '../team.entity';
import { UUID } from '../../common/types';

@Exclude()
export class SerializedUpdatedTeam extends Team {
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

  constructor(partial: Partial<SerializedUpdatedTeam>) {
    super();
    Object.assign(this, partial);
  }
}
