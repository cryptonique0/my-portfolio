import { useState } from 'react';
import { supabase } from '../config/supabase';
import ConnectWalletButton from '../components/ConnectWalletButton';
import { config } from '../config/env';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage('Signed in successfully');
    } catch (err: any) {
      setMessage(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMessage('Check your email to confirm signup');
    } catch (err: any) {
      setMessage(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'twitter') => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + '/auth' } });
      if (error) throw error;
    } catch (err: any) {
      setMessage(err.message || 'OAuth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Wallet</h2>
          <p className="text-sm text-gray-500 mb-4">Connect your wallet to sign in.</p>
          <ConnectWalletButton />
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Email</h2>
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <button type="submit" disabled={loading} className="w-full bg-black text-white rounded px-3 py-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" onClick={handleEmailSignUp} disabled={loading} className="w-full border rounded px-3 py-2">
              {loading ? 'Working…' : 'Create account'}
            </button>
          </form>
          <div className="mt-3">
            <h3 className="text-sm font-medium mb-2">Or continue with</h3>
            <div className="flex gap-2">
              <button onClick={() => handleOAuth('google')} className="border rounded px-3 py-2">Google</button>
              <button onClick={() => handleOAuth('github')} className="border rounded px-3 py-2">GitHub</button>
              <button onClick={() => handleOAuth('twitter')} className="border rounded px-3 py-2">Twitter</button>
            </div>
          </div>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
