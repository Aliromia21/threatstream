import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { config } from '../config';
import { processEvent } from '../processors/eventProcessor';

// Kafka Consumer


const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  retry: {
    initialRetryTime: 300,
    retries: 5,
  },
});

const consumer: Consumer = kafka.consumer({
  groupId: config.kafkaGroupId,
});

const TOPICS = ['auth-events', 'network-events', 'threat-alerts'];

let messagesProcessed = 0;

export async function startConsumer(): Promise<void> {
  await consumer.connect();
  console.log('[kafka] Consumer connected');

  for (const topic of TOPICS) {
    await consumer.subscribe({ topic, fromBeginning: true });
    console.log(`[kafka] Subscribed to: ${topic}`);
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      try {
        if (!message.value) return;

        const event = JSON.parse(message.value.toString());

        await processEvent(event);

        messagesProcessed++;

        if (messagesProcessed % 50 === 0) {
          console.log(`[consumer] Processed ${messagesProcessed} events`);
        }
      } catch (error) {
        console.error(`[consumer] Error processing message from ${topic}:${partition}:`, error);
      }
    },
  });
}

export async function stopConsumer(): Promise<void> {
  await consumer.disconnect();
  console.log(`[kafka] Consumer disconnected — total processed: ${messagesProcessed}`);
}