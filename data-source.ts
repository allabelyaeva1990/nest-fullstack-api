import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Загружаем .env для CLI команд TypeORM
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'mysecretpassword',
  database: process.env.DB_NAME || 'nest_fullstack',

  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/migration/*.js'],
  logging: true,

  synchronize: false, // ВАЖНО: всегда false, используем миграции
});
