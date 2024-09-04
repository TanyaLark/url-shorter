import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { generateUniqueCode } from '../utils/codeGenerator';
import { Team } from '../team/team.entity';

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

  @ManyToOne(() => User, (user) => user.urls, { onDelete: 'SET NULL' })
  @JoinTable()
  user: User;

  @ManyToOne(() => Team, (team) => team.urls, { onDelete: 'CASCADE' })
  @JoinTable()
  team: Team;

  @BeforeInsert()
  generateCode() {
    this.code = generateUniqueCode();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
