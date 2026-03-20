import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  eventApiUrl: process.env.EVENT_API_URL || 'http://localhost:3001',
  eventsPerSecond: parseInt(process.env.EVENTS_PER_SECOND || '5', 10),
  mode: process.env.SIMULATOR_MODE || 'mixed',
};

console.log(`[simulator] Config — target=${config.eventApiUrl}, rate=${config.eventsPerSecond}/s, mode=${config.mode}`);

export { config };