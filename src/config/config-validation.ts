import { plainToClass } from 'class-transformer';
import {
  IsAlpha,
  IsDefined,
  IsEnum,
  IsNumberString,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';
import { Environment } from './configs';

class EnvironmentVariables {
  /* APP CONFIG */
  @IsDefined()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsDefined()
  @IsNumberString()
  @MinLength(1)
  APP_PORT: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  APP_NAME: string;

  /* DATA CONFIG */
  @IsDefined()
  @IsNumberString()
  @MinLength(1)
  DATABASE_PORT: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  DATABASE_HOST: string;

  @IsDefined()
  @IsAlpha()
  @MinLength(1)
  DATABASE_USERNAME: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  DATABASE_PASSWORD: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  DATABASE: string;
}

export function validateConfig(configuration: Record<string, unknown>) {
  const finalConfig = plainToClass(EnvironmentVariables, configuration, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(finalConfig, { skipMissingProperties: false });

  let index = 0;
  for (const err of errors) {
    Object.values(err.constraints).map((str) => {
      ++index;
      console.log(index, str);
    });
    console.log('\n ***** \n');
  }
  if (errors.length)
    throw new Error('Please provide the valid ENVs mentioned above');

  return finalConfig;
}
