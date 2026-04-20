import { eventSchema } from './eventSchema';
import { z } from 'zod';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: Record<string, unknown>;
}

export function validateEvent(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      errors: ['Request body must be a JSON object'],
    };
  }

  try {
    const parsed = eventSchema.parse(body);
    return {
      valid: true,
      errors: [],
      data: parsed as unknown as Record<string, unknown>,
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const bodyObj = body as Record<string, unknown>;
      const messages: string[] = error.issues.map((issue) => {
        const field = issue.path.join('.');

        // Missing field
        if (bodyObj[field] === undefined && issue.path.length > 0) {
          return `Missing required field: ${field}`;
        }

        // Invalid event type
        if (field === 'type' && issue.message === 'Invalid event type') {
          return `Invalid event type: ${bodyObj.type}`;
        }

        // Metadata must be an object
        if (field === 'metadata') {
          return 'metadata must be an object';
        }

        return issue.message;
      });

      return {
        valid: false,
        errors: messages,
      };
    }

    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}