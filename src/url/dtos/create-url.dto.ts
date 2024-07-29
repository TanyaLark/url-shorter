import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
} from 'class-validator';
import { UrlType } from '../url.entity';

export class CreateUrlDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  originalUrl: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  alias: string;

  @ApiProperty()
  @IsEnum(UrlType)
  @IsOptional()
  type: UrlType;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  expiresAt: Date;
}
