import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;

  console.log('=== DATABASE CONFIG DEBUG ===');
  console.log('DATABASE_URL exists:', !!databaseUrl);
  console.log('DATABASE_URL value:', databaseUrl ? 'SET' : 'NOT SET');

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      const config = {
        host: url.hostname,
        port: parseInt(url.port, 10),
        username: url.username,
        password: url.password,
        name: url.pathname.slice(1),
      };
      console.log('Parsed config:', {
        host: config.host,
        port: config.port,
        username: config.username,
        database: config.name,
      });
      return config;
    } catch (error) {
      console.error('Failed to parse DATABASE_URL:', error);
    }
  }

  // Fallback
  const fallbackConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'nest_fullstack',
  };

  console.log('Using fallback config:', {
    host: fallbackConfig.host,
    port: fallbackConfig.port,
    username: fallbackConfig.username,
    database: fallbackConfig.name,
  });

  return fallbackConfig;
});
