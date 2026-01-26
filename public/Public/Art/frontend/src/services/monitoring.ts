import * as Sentry from '@sentry/react';
import LogRocket from 'logrocket';

export function initMonitoring() {
  const enableSentry = (import.meta.env.VITE_ENABLE_SENTRY || '').toLowerCase() === 'true';
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN || '';

  if (enableSentry && sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      integrations: [],
    });
  }

  const enableLogRocket = (import.meta.env.VITE_ENABLE_LOGROCKET || '').toLowerCase() === 'true';
  const logRocketId = import.meta.env.VITE_LOGROCKET_APP_ID || '';

  if (enableLogRocket && logRocketId) {
    LogRocket.init(logRocketId);
  }
}
