import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // Railway предоставляет DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: url.username,
      password: url.password,
      name: url.pathname.slice(1),
    };
  }

  // Fallback на отдельные переменные
  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  };
});
