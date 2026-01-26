import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { MarketplaceService } from './marketplace-refactored';

class PriceAlertsServiceClass {
  async createAlert(userId: string, nftId: string, params: { alertType: 'below_price' | 'percent_drop'; targetPrice?: number; percentDrop?: number }) {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: userId,
        nft_id: nftId,
        alert_type: params.alertType,
        target_price: params.targetPrice,
        percent_drop: params.percentDrop,
        is_active: true
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async listAlerts(userId: string) {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async deleteAlert(userId: string, alertId: string) {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  }

  async checkAlertsForUser(userId: string) {
    // Fetch active alerts
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) throw error;

    const notifications: Array<{ alertId: string; nftId: string; type: string; currentPrice: number }> = [];

    for (const alert of alerts || []) {
      try {
        // Fetch current price from marketplace service
        const price = await MarketplaceService.getCurrentPrice(alert.nft_id);
        if (!price) continue;

        // Evaluate conditions
        if (alert.alert_type === 'below_price' && alert.target_price && price <= Number(alert.target_price)) {
          notifications.push({ alertId: alert.id, nftId: alert.nft_id, type: 'below_price', currentPrice: price });
        }
        if (alert.alert_type === 'percent_drop' && alert.percent_drop && alert.last_price) {
          const drop = ((Number(alert.last_price) - price) / Number(alert.last_price)) * 100;
          if (drop >= Number(alert.percent_drop)) {
            notifications.push({ alertId: alert.id, nftId: alert.nft_id, type: 'percent_drop', currentPrice: price });
          }
        }

        // Update last_price for next evaluation
        await supabase
          .from('price_alerts')
          .update({ last_price: price })
          .eq('id', alert.id);
      } catch (err) {
        logger.warn('Alert check failed for alert', alert.id, err);
      }
    }

    return notifications;
  }
}

export const PriceAlertsService = new PriceAlertsServiceClass();