import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

// Datadog tracer is CommonJS; use require to avoid TS type friction
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ddTrace = (() => {
  try {
    // defer require so build doesn't fail if not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('dd-trace');
  } catch {
    return null;
  }
})();

export function initMonitoring() {
  dotenv.config();

  const enableSentry = (process.env.ENABLE_SENTRY || '').toLowerCase() === 'true';
  const sentryDsn = process.env.SENTRY_DSN || '';

  if (enableSentry && sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      integrations: [],
    });
  }

  const enableDatadog = (process.env.ENABLE_DATADOG || '').toLowerCase() === 'true';
  const serviceName = process.env.DATADOG_SERVICE_NAME || 'bitart-backend';

  if (enableDatadog && ddTrace) {
    try {
      ddTrace.init({
        service: serviceName,
        env: process.env.NODE_ENV || 'development',
      });
    } catch (err) {
      // swallow init errors to avoid crashing
      // eslint-disable-next-line no-console
      console.warn('Datadog init failed:', (err as Error).message);
    }
  }
}
