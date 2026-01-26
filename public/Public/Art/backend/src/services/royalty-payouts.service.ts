import { supabase } from '../config/supabase';

class RoyaltyPayoutsServiceClass {
  async requestPayout(creatorWallet: string, amount: number, currency: string = 'STX', notes?: string) {
    const { data, error } = await supabase
      .from('royalty_payouts')
      .insert({ creator_wallet: creatorWallet, amount, currency, notes })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async listPayouts(creatorWallet: string) {
    const { data, error } = await supabase
      .from('royalty_payouts')
      .select('*')
      .eq('creator_wallet', creatorWallet)
      .order('requested_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async cancelPayout(payoutId: string, creatorWallet: string) {
    const { data, error } = await supabase
      .from('royalty_payouts')
      .update({ status: 'failed', notes: 'Cancelled by user' })
      .eq('id', payoutId)
      .eq('creator_wallet', creatorWallet)
      .eq('status', 'pending')
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async markProcessed(payoutId: string, txHash: string) {
    const { data, error } = await supabase
      .from('royalty_payouts')
      .update({ status: 'processed', processed_at: new Date().toISOString(), tx_hash: txHash })
      .eq('id', payoutId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}

export const RoyaltyPayoutsService = new RoyaltyPayoutsServiceClass();