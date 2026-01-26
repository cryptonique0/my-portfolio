/**
 * Google Analytics Service
 * Handles GA4 initialization and event tracking
 */

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface GAConfig {
  measurementId: string;
  debug?: boolean;
}

class GoogleAnalyticsService {
  private initialized = false;
  private config: GAConfig | null = null;

  /**
   * Initialize Google Analytics with GA4
   */
  init(config: GAConfig) {
    this.config = config;

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer!.push(args);
    }
    gtag('js', new Date());
    gtag('config', config.measurementId, {
      debug_mode: config.debug || false,
      allow_google_signals: true,
      allow_ad_personalization_signals: true,
    });

    window.gtag = gtag;
    this.initialized = true;
    console.log('[GA] Google Analytics initialized:', config.measurementId);
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string) {
    if (!this.initialized || !window.gtag) return;
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, eventData?: Record<string, any>) {
    if (!this.initialized || !window.gtag) return;
    window.gtag('event', eventName, eventData || {});
  }

  /**
   * Track conversion (purchase, signup, etc.)
   */
  trackConversion(conversionName: string, value?: number, currency: string = 'USD') {
    if (!this.initialized || !window.gtag) return;
    window.gtag('event', 'conversion', {
      conversion_name: conversionName,
      value: value || 0,
      currency: currency,
    });
  }

  /**
   * Track exception/error
   */
  trackException(description: string, fatal: boolean = false) {
    if (!this.initialized || !window.gtag) return;
    window.gtag('event', 'exception', {
      description: description,
      fatal: fatal,
    });
  }

  /**
   * Set user ID for cross-device tracking
   */
  setUserId(userId: string) {
    if (!this.initialized || !window.gtag) return;
    window.gtag('config', this.config?.measurementId || '', {
      user_id: userId,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized || !window.gtag) return;
    window.gtag('set', { user_properties: properties });
  }
}

export const analyticsService = new GoogleAnalyticsService();
