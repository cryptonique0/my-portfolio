import * as Sentry from '@sentry/node';
import { RequestHandler, ErrorRequestHandler } from 'express';

const isSentryEnabled = () => {
  return (process.env.ENABLE_SENTRY || '').toLowerCase() === 'true' && !!process.env.SENTRY_DSN;
};

export const sentryRequestHandler = (): RequestHandler => {
  if (isSentryEnabled()) {
    return Sentry.Handlers.requestHandler();
  }
  return (_req, _res, next) => next();
};

export const sentryErrorHandler = (): ErrorRequestHandler => {
  if (isSentryEnabled()) {
    return Sentry.Handlers.errorHandler();
  }
  return (err, _req, _res, next) => next(err);
};
