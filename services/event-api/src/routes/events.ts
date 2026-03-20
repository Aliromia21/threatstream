import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateEvent } from '../validators/eventValidator';
import { AppError } from '../middleware/errorHandler';
import { sendEvent, getTopicForEvent } from '../kafka';

const router = Router();

router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Step 1: Validate
    const validation = validateEvent(req.body);

    if (!validation.valid) {
      throw new AppError(
        `Validation failed: ${validation.errors.join('; ')}`,
        400
      );
    }

    // Step 2: Enrich
    const enrichedEvent = {
      id: uuidv4(),
      type: req.body.type,
      sourceIp: req.body.sourceIp,
      targetEndpoint: req.body.targetEndpoint || '/unknown',
      timestamp: req.body.timestamp,
      sessionId: req.body.sessionId || null,
      userId: req.body.userId || null,
      metadata: req.body.metadata || {},
      receivedAt: new Date().toISOString(),
    };

    // Step 3: Produce to Kafka
    const topic = getTopicForEvent(enrichedEvent.type);
    await sendEvent(topic, enrichedEvent.sourceIp, enrichedEvent);

    console.log(`[event-api] Event sent to ${topic}: ${enrichedEvent.type} from ${enrichedEvent.sourceIp}`);

    // Step 4: Respond immediately
    res.status(202).json({
      accepted: true,
      eventId: enrichedEvent.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;