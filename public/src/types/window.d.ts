// Global type definitions for wallet providers

declare global {
  interface Window {
    xverse?: {
      request: (method: string, params?: any) => Promise<any>;
    };
    LeatherProvider?: {
      request: (method: string, params?: any) => Promise<any>;
    };
    hiro?: {
      request: (method: string, params?: any) => Promise<any>;
    };
  }
}

export {};
