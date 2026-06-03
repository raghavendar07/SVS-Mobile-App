import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Node mock server for Vitest. */
export const server = setupServer(...handlers);
