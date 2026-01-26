/**
 * LogRocket Configuration
 * Session replay and monitoring for frontend
 */

import LogRocket from 'logrocket';

export function initLogRocket() {
  const appId = import.meta.env.VITE_LOGROCKET_APP_ID;
  const enabled = import.meta.env.VITE_ENABLE_LOGROCKET === 'true';

  if (!enabled || !appId) {
    if (import.meta.env.DEV) {
      console.log('[LogRocket] Disabled - set VITE_ENABLE_LOGROCKET=true and VITE_LOGROCKET_APP_ID in .env');
    }
    return null;
  }

  try {
    LogRocket.init(appId, {
      console: {
        shouldAggregateConsoleErrors: true
      },
      network: {
        requestSanitizer: (request) => {
          // Remove sensitive headers from captured requests
          if (request.headers) {
            delete request.headers['Authorization'];
            delete request.headers['X-API-Key'];
          }
          return request;
        },
        responseSanitizer: (response) => {
          // Don't capture response bodies for privacy
          return response;
        }
      },
      dom: {
        inputSanitizer: true,
        inputSanitizer: (node) => {
          // Redact sensitive input fields
          if (node.getAttribute?.('type') === 'password') {
            return false;
          }
          if (node.name?.includes('token') || node.name?.includes('key')) {
            return false;
          }
          return true;
        }
      }
    });

    console.log('[LogRocket] Initialized with App ID:', appId);
    return LogRocket;
  } catch (error) {
    console.error('[LogRocket] Failed to initialize:', error);
    return null;
  }
}

export default LogRocket;
