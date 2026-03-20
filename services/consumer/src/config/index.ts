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
  kafkaBrokers: requireEnv('KAFKA_BROKERS').split(','),
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'threatstream-consumer',
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'consumer',
  dbHost: requireEnv('DB_HOST'),
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbName: requireEnv('DB_NAME'),
  dbUser: requireEnv('DB_USER'),
  dbPassword: requireEnv('DB_PASSWORD'),
};

console.log(`[config] Loaded — brokers=${config.kafkaBrokers.join(',')}, group=${config.kafkaGroupId}, db=${config.dbHost}:${config.dbPort}/${config.dbName}`);

export { config };
