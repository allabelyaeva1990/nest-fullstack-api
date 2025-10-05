import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV?: string;

  @IsString()
  PORT?: string;

  @IsString()
  DATABASE_URL?: string;

  @IsString()
  DB_HOST?: string;

  @IsString()
  DB_PORT?: string;

  @IsString()
  DB_USERNAME?: string;

  @IsString()
  DB_PASSWORD?: string;

  @IsString()
  DB_NAME?: string;

  @IsString()
  JWT_SECRET?: string;

  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsString()
  THROTTLE_TTL?: string;

  @IsString()
  THROTTLE_LIMIT?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
