import { supabase, supabaseAdmin } from '../config/supabase';

class OffersServiceClass {
  async createOffer(nftId: string, buyerAddress: string, amount: number, expiresAt?: string, currency: string = 'STX') {
    const { data, error } = await supabase
      .from('offers')
      .insert({ nft_id: nftId, buyer_address: buyerAddress, amount, currency, expires_at: expiresAt })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async listNFTOffers(nftId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('nft_id', nftId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async listUserOffers(address: string) {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .or(`buyer_address.eq.${address},seller_address.eq.${address}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async acceptOffer(offerId: string, sellerAddress: string) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'open') throw new Error('Offer not open');

    // Seller-only guard: ensure requester is current NFT owner
    const { data: nft } = await supabase
      .from('nfts')
      .select('id,owner_id')
      .eq('id', offer.nft_id)
      .single();
    if (!nft) throw new Error('NFT not found');
    const { data: owner } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', nft.owner_id)
      .single();
    if (!owner || (owner.wallet_address || '').toLowerCase() !== (sellerAddress || '').toLowerCase()) {
      throw new Error('Forbidden: only current owner can accept');
    }

    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'accepted', seller_address: offer.seller_address || sellerAddress })
      .eq('id', offerId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async rejectOffer(offerId: string, sellerAddress: string) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'open') throw new Error('Offer not open');

    // Seller-only guard: ensure requester is current NFT owner
    const { data: nft } = await supabase
      .from('nfts')
      .select('id,owner_id')
      .eq('id', offer.nft_id)
      .single();
    if (!nft) throw new Error('NFT not found');
    const { data: owner } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', nft.owner_id)
      .single();
    if (!owner || (owner.wallet_address || '').toLowerCase() !== (sellerAddress || '').toLowerCase()) {
      throw new Error('Forbidden: only current owner can reject');
    }

    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'rejected', seller_address: offer.seller_address || sellerAddress })
      .eq('id', offerId)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async counterOffer(offerId: string, sellerAddress: string, amount: number, expiresAt?: string) {
    const { data: offer } = await supabase
      .from('offers')
      .select('*')
      .eq('id', offerId)
      .single();
    if (!offer) throw new Error('Offer not found');
    if (offer.status !== 'open') throw new Error('Offer not open');

    const { data: newOffer, error: insertError } = await supabase
      .from('offers')
      .insert({
        nft_id: offer.nft_id,
        buyer_address: offer.buyer_address,
        seller_address: sellerAddress,
        amount,
        currency: offer.currency,
        expires_at: expiresAt,
        parent_offer_id: offer.id,
      })
      .select('*')
      .single();
    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('offers')
      .update({ status: 'countered' })
      .eq('id', offer.id);
    if (updateError) throw updateError;

    return newOffer;
  }

  async expireOpenOffers(): Promise<number> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'expired' })
      .eq('status', 'open')
      .lt('expires_at', now)
      .select('id');
    if (error) throw error;
    return (data || []).length;
  }
}

export const OffersService = new OffersServiceClass();