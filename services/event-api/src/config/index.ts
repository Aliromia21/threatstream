import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  kafkaBrokers: string[];
  kafkaClientId: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[config] Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  kafkaBrokers: requireEnv('KAFKA_BROKERS').split(','),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'event-api',
};

console.log(`[config] Loaded — port=${config.port}, env=${config.nodeEnv}, brokers=${config.kafkaBrokers.join(',')}`);