import * as dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[config] Missing required environment variable: ${name}`);
  }
  return value;
}

const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbHost: requireEnv('DB_HOST'),
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbName: requireEnv('DB_NAME'),
  dbUser: requireEnv('DB_USER'),
  dbPassword: requireEnv('DB_PASSWORD'),
};

console.log(`[config] Loaded — port=${config.port}, db=${config.dbHost}:${config.dbPort}/${config.dbName}`);

export { config };

