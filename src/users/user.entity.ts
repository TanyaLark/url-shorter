import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Url } from '../url/url.entity';

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({ default: false })
  emailConfirmed: boolean;

  @Column({ default: null, nullable: true })
  emailConfirmToken: string;

  @Column()
  passwordHash: string;

  @Column()
  salt: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: null, nullable: true })
  updatedAt: Date;

  @OneToMany(() => Url, (url) => url.user)
  urls: Url[];

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
