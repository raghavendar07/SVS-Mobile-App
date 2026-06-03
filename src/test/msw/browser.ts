import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** Dev-only mock backend worker. Started from bootstrap when no real API is configured. */
export const worker = setupWorker(...handlers);
