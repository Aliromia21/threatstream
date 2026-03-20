import axios from 'axios';
import { config } from './config/index';
import { generateNormalEvent } from './patterns/normalTraffic';
import { BruteForcePattern } from './patterns/bruteForce';
import { PortScanPattern } from './patterns/portScan';

// Active attack patterns
let activeBruteForce: BruteForcePattern | null = null;
let activePortScan: PortScanPattern | null = null;

// Stats
let eventsSent = 0;
let errors = 0;

async function sendEvent(event: object): Promise<void> {
  try {
    await axios.post(`${config.eventApiUrl}/events`, event);
    eventsSent++;
  } catch (error) {
    errors++;
    if (axios.isAxiosError(error)) {
      console.error(`[simulator] Failed to send event: ${error.message}`);
    }
  }
}

function generateEvent(): object {
  // If there's an active brute force attack, continue it
  if (activeBruteForce && activeBruteForce.hasMore()) {
    return activeBruteForce.nextEvent();
  } else {
    activeBruteForce = null;
  }

  // If there's an active port scan, continue it
  if (activePortScan && activePortScan.hasMore()) {
    return activePortScan.nextEvent();
  } else {
    activePortScan = null;
  }

  // Decide what to generate next
  const roll = Math.random();

  if (roll < 0.10) {
    // 10% chance — start a new brute force attack
    console.log('[simulator] Starting brute force attack pattern');
    activeBruteForce = new BruteForcePattern();
    return activeBruteForce.nextEvent();
  }

  if (roll < 0.15) {
    // 5% chance — start a new port scan
    console.log('[simulator] Starting port scan pattern');
    activePortScan = new PortScanPattern();
    return activePortScan.nextEvent();
  }

  // 85% — normal traffic
  return generateNormalEvent();
}

// Main Loop
async function tick(): Promise<void> {
  const event = generateEvent();
  await sendEvent(event);
}

function startSimulator(): void {
  console.log(`[simulator] Starting — sending ${config.eventsPerSecond} events/second`);

  const intervalMs = 1000 / config.eventsPerSecond;

  setInterval(tick, intervalMs);

  setInterval(() => {
    console.log(`[simulator] Stats — sent=${eventsSent}, errors=${errors}`);
  }, 10000);
}


// Graceful Shutdown

process.on('SIGINT', () => {
  console.log(`[simulator] Shutting down — total events sent: ${eventsSent}`);
  process.exit(0);
});

startSimulator();
