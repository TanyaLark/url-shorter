import { Exclude, Expose } from 'class-transformer';
import { User, UserRole } from '../../users/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class SerializedUser extends User {
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

  @ApiProperty({ enum: UserRole, examples: [UserRole.User, UserRole.Admin] })
  @Expose()
  role: UserRole;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<SerializedUser>) {
    super();
    Object.assign(this, partial);
  }
}
