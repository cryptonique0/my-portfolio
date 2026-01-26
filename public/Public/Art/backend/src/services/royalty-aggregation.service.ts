import { supabase, supabaseAdmin } from '../config/supabase';

class RoyaltyAggregationServiceClass {
  /**
   * Aggregate royalty earnings into available_balance for each creator
   * Processes all unpaid royalties and updates user balances
   */
  async aggregateRoyalties(): Promise<void> {
    try {
      console.log('[RoyaltyAggregation] Starting royalty aggregation...');
      
      // Get all royalty earnings grouped by creator
      const { data: royalties, error: royaltiesError } = await supabaseAdmin
        .from('royalties')
        .select('creator_wallet, amount')
        .is('paid_out', false);

      if (royaltiesError) throw royaltiesError;
      if (!royalties || royalties.length === 0) {
        console.log('[RoyaltyAggregation] No unpaid royalties found');
        return;
      }

      // Group by creator and sum amounts
      const balances = royalties.reduce((acc: Record<string, number>, r) => {
        if (!acc[r.creator_wallet]) acc[r.creator_wallet] = 0;
        acc[r.creator_wallet] += Number(r.amount);
        return acc;
      }, {});

      // Update available_balance for each creator
      for (const [wallet, amount] of Object.entries(balances)) {
        // Get current balance
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('available_balance')
          .eq('wallet_address', wallet)
          .single();

        const currentBalance = Number(user?.available_balance || 0);
        const newBalance = currentBalance + amount;

        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ available_balance: newBalance })
          .eq('wallet_address', wallet);

        if (updateError) {
          console.error(`[RoyaltyAggregation] Error updating balance for ${wallet}:`, updateError);
          continue;
        }

        // Mark royalties as paid out
        await supabaseAdmin
          .from('royalties')
          .update({ paid_out: true })
          .eq('creator_wallet', wallet)
          .is('paid_out', false);

        console.log(`[RoyaltyAggregation] Updated ${wallet}: +${amount}`);
      }

      console.log(`[RoyaltyAggregation] Completed. Updated ${Object.keys(balances).length} creators`);
    } catch (error) {
      console.error('[RoyaltyAggregation] Error:', error);
    }
  }

  /**
   * Check auto-payout thresholds and create payout requests automatically
   */
  async processAutoPayouts(): Promise<void> {
    try {
      console.log('[AutoPayout] Checking auto-payout thresholds...');

      // Get users with auto-payout enabled and balance >= threshold
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('wallet_address, available_balance, auto_payout_threshold')
        .eq('auto_payout_enabled', true);

      if (usersError) throw usersError;
      if (!users || users.length === 0) {
        console.log('[AutoPayout] No users eligible for auto-payout');
        return;
      }

      // Filter users where balance >= threshold
      const eligible = users.filter(u => Number(u.available_balance) >= Number(u.auto_payout_threshold));
      if (eligible.length === 0) {
        console.log('[AutoPayout] No users meet threshold criteria');
        return;
      }

      const RoyaltyPayoutsService = (await import('./royalty-payouts.service')).RoyaltyPayoutsService;

      for (const user of eligible) {
        const amount = Number(user.available_balance);
        try {
          // Create payout request
          await RoyaltyPayoutsService.requestPayout(
            user.wallet_address,
            amount,
            'STX',
            'Automatic payout (threshold reached)'
          );

          // Deduct from available_balance
          await supabaseAdmin
            .from('users')
            .update({ 
              available_balance: 0
            })
            .eq('wallet_address', user.wallet_address);

          console.log(`[AutoPayout] Created payout for ${user.wallet_address}: ${amount} STX`);
        } catch (error) {
          console.error(`[AutoPayout] Error creating payout for ${user.wallet_address}:`, error);
        }
      }

      console.log(`[AutoPayout] Completed. Processed ${eligible.length} users`);
    } catch (error) {
      console.error('[AutoPayout] Error:', error);
    }
  }

  /**
   * Run both aggregation and auto-payout in sequence
   */
  async runFullCycle(): Promise<void> {
    await this.aggregateRoyalties();
    await this.processAutoPayouts();
  }
}

export const RoyaltyAggregationService = new RoyaltyAggregationServiceClass();
