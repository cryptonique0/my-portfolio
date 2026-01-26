/**
 * Frontend Auth Service
 * - MetaMask connect + sign-in
 * - Supabase email/password + OAuth (delegated to Supabase client)
 */

export class AuthService {
  private tokenKey = 'bitart_app_jwt';
  private baseURL = '/api/auth';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  getAuthHeader(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async connectMetaMask(): Promise<string | null> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('MetaMask not detected');

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    return address || null;
  }

  async requestNonce(address: string): Promise<{ message: string; nonce: string }> {
    const url = new URL(`${this.baseURL}/nonce`, window.location.origin);
    url.searchParams.set('address', address);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to request nonce');
    return res.json();
  }

  async signMessage(message: string): Promise<string> {
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error('MetaMask not detected');
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts[0];
    const signature = await ethereum.request({ method: 'personal_sign', params: [message, from] });
    return signature;
  }

  async verifySignature(address: string, signature: string): Promise<{ token: string; userId: string }> {
    const res = await fetch(`${this.baseURL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature }),
    });
    if (!res.ok) throw new Error('Signature verification failed');
    return res.json();
  }

  async signInWithMetaMask(): Promise<{ address: string; userId: string } | null> {
    const address = await this.connectMetaMask();
    if (!address) return null;

    const { message } = await this.requestNonce(address);
    const signature = await this.signMessage(message);
    const { token, userId } = await this.verifySignature(address, signature);
    this.setToken(token);
    return { address, userId };
  }
}

export default new AuthService();
