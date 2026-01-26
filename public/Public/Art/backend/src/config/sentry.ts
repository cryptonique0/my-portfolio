/**
 * Sentry Configuration for Backend
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/node';
import { getConfig } from './env';

const config = getConfig();

export function initSentry() {
  if (process.env.ENABLE_SENTRY !== 'true') {
    console.log('[Sentry] Disabled in development/testing');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN || config.monitoring.sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({
        request: true,
        response: true,
        serverName: false
      })
    ],
    maxBreadcrumbs: 50,
    beforeSend(event) {
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'TypeError' && error.value?.includes('Cannot read properties')) {
          // Filter out some non-critical errors
          return null;
        }
      }
      return event;
    }
  });

  console.log('[Sentry] Initialized with DSN:', process.env.SENTRY_DSN ? 'configured' : 'using env');
}

export { Sentry };
