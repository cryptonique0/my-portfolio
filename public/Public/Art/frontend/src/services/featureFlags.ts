// Feature flags abstraction supporting LaunchDarkly and Flagsmith

export type FlagProvider = 'launchdarkly' | 'flagsmith';

class FeatureFlags {
  private provider: FlagProvider | null = null;
  private ldClient: any | null = null;
  private fsClient: any | null = null;
  private ready = false;

  async init() {
    const enabled = (import.meta.env.VITE_ENABLE_FEATURE_FLAGS || '').toLowerCase() === 'true';
    if (!enabled) return;

    const provider = (import.meta.env.VITE_FEATURE_FLAG_PROVIDER || 'launchdarkly') as FlagProvider;
    this.provider = provider;

    if (provider === 'launchdarkly') {
      const clientId = import.meta.env.VITE_LAUNCHDARKLY_CLIENT_ID || '';
      if (!clientId) return;
      const ld = await import('launchdarkly-js-client-sdk');
      this.ldClient = ld.initialize(clientId, { key: 'anonymous' });
      this.ldClient.on('ready', () => { this.ready = true; });
    } else if (provider === 'flagsmith') {
      const envId = import.meta.env.VITE_FLAGSMITH_ENV_ID || '';
      if (!envId) return;
      const flagsmith = (await import('flagsmith')).default;
      flagsmith.init({ environmentID: envId });
      this.fsClient = flagsmith;
      this.ready = true;
    }
  }

  getFlag<T = boolean>(key: string, defaultValue: T): T {
    if (!this.ready) return defaultValue;

    if (this.provider === 'launchdarkly' && this.ldClient) {
      return this.ldClient.variation(key, defaultValue);
    }
    if (this.provider === 'flagsmith' && this.fsClient) {
      try {
        const v = this.fsClient.getValue(key);
        return (v ?? defaultValue) as T;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  onChange(key: string, cb: (value: unknown) => void) {
    if (!this.ready) return;
    if (this.provider === 'launchdarkly' && this.ldClient) {
      this.ldClient.on(`change:${key}`, (settings: any) => cb(settings.current));
    }
    if (this.provider === 'flagsmith' && this.fsClient) {
      this.fsClient.on('change', () => cb(this.fsClient.getValue(key)));
    }
  }

  track(event: string, data?: Record<string, unknown>) {
    if (!this.ready) return;
    if (this.provider === 'launchdarkly' && this.ldClient) {
      this.ldClient.track(event, data || {});
    }
    // Flagsmith has analytics addon; keep simple no-op here
  }
}

export const featureFlags = new FeatureFlags();
