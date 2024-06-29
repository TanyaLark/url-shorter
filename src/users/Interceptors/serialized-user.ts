import { Exclude, Expose } from 'class-transformer';
import { User, UserRole } from '../user.entity';

@Exclude()
export class SerializedUser extends User {
  @Expose()
  id: string;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<SerializedUser>) {
    super();
    Object.assign(this, partial);
  }
}
