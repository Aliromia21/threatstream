import { Kafka, Producer, Partitioners } from 'kafkajs';
import { config } from '../config';

// Kafka Producer — Singleton

const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

const producer: Producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
});

let isConnected = false;

export async function connectProducer(): Promise<void> {
  try {
    await producer.connect();
    isConnected = true;
    console.log('[kafka] Producer connected');
  } catch (error) {
    console.error('[kafka] Failed to connect producer:', error);
    throw error;
  }
}

export async function disconnectProducer(): Promise<void> {
  try {
    await producer.disconnect();
    isConnected = false;
    console.log('[kafka] Producer disconnected');
  } catch (error) {
    console.error('[kafka] Failed to disconnect producer:', error);
  }
}

export async function sendEvent(
  topic: string,
  key: string,
  value: object
): Promise<void> {
  if (!isConnected) {
    throw new Error('[kafka] Producer is not connected');
  }

  await producer.send({
    topic,
    messages: [
      {
        key,
        value: JSON.stringify(value),
      },
    ],
  });
}

export function isProducerConnected(): boolean {
  return isConnected;
}