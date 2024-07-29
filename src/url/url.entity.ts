import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { generateUniqueCode } from '../utils/codeGenerator';

export enum UrlType {
  Permanent = 'Permanent link',
  Temporary = 'Temporary link',
  OneTime = 'One-Time link',
}

@Entity()
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  originalUrl: string;

  @Column({ default: null, nullable: true })
  alias: string;

  @Column({ type: 'enum', enum: UrlType, default: UrlType.Permanent })
  type: UrlType;

  @Column({ default: null, nullable: true })
  redirectionCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: null, nullable: true })
  updatedAt: Date;

  @Column({ default: null, nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.urls)
  user: User;

  @BeforeInsert()
  generateCode() {
    this.code = generateUniqueCode();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
