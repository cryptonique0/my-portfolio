/**
 * Custom Event Tracking Service
 * Tracks custom events for the BitArt marketplace
 */

import { analyticsService } from './google-analytics.service';

export interface EventData {
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

class EventTrackingService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize session tracking
   */
  private initializeSession() {
    sessionStorage.setItem('sessionId', this.sessionId);
    console.log('[EventTracking] Session started:', this.sessionId);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Track NFT view event
   */
  trackNFTView(nftId: string, nftName: string, price?: number) {
    analyticsService.trackEvent('nft_view', {
      nft_id: nftId,
      nft_name: nftName,
      price: price || 0,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track NFT search
   */
  trackSearch(query: string, resultsCount: number, filters?: Record<string, any>) {
    analyticsService.trackEvent('search', {
      search_query: query,
      results_count: resultsCount,
      filters: filters || {},
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track collection view
   */
  trackCollectionView(collectionId: string, collectionName: string, itemCount: number) {
    analyticsService.trackEvent('collection_view', {
      collection_id: collectionId,
      collection_name: collectionName,
      item_count: itemCount,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track offer creation
   */
  trackOfferCreated(nftId: string, offerAmount: number, currency: string = 'STX') {
    analyticsService.trackEvent('offer_created', {
      nft_id: nftId,
      offer_amount: offerAmount,
      currency: currency,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track offer accepted (purchase)
   */
  trackOfferAccepted(nftId: string, purchaseAmount: number, currency: string = 'STX') {
    analyticsService.trackConversion('purchase', purchaseAmount, currency);
    analyticsService.trackEvent('offer_accepted', {
      nft_id: nftId,
      purchase_amount: purchaseAmount,
      currency: currency,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track offer counter
   */
  trackOfferCountered(nftId: string, counterAmount: number) {
    analyticsService.trackEvent('offer_countered', {
      nft_id: nftId,
      counter_amount: counterAmount,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user login
   */
  trackLogin(wallet: string, method: string = 'wallet_connect') {
    analyticsService.trackEvent('login', {
      wallet_address: wallet,
      login_method: method,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user signup
   */
  trackSignup(wallet: string) {
    analyticsService.trackConversion('signup');
    analyticsService.trackEvent('signup', {
      wallet_address: wallet,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user logout
   */
  trackLogout(wallet: string) {
    analyticsService.trackEvent('logout', {
      wallet_address: wallet,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track wishlist add
   */
  trackWishlistAdd(nftId: string, nftName: string) {
    analyticsService.trackEvent('wishlist_add', {
      nft_id: nftId,
      nft_name: nftName,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track collection add
   */
  trackCollectionAdd(collectionId: string, collectionName: string) {
    analyticsService.trackEvent('collection_add', {
      collection_id: collectionId,
      collection_name: collectionName,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track filter usage
   */
  trackFilterUsage(filters: Record<string, any>) {
    analyticsService.trackEvent('filter_applied', {
      filters: JSON.stringify(filters),
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track page time on site
   */
  trackTimeOnPage(page: string, duration: number) {
    analyticsService.trackEvent('time_on_page', {
      page_name: page,
      duration_seconds: duration,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track click event with position
   */
  trackClickEvent(element: string, x: number, y: number) {
    analyticsService.trackEvent('click', {
      element: element,
      position_x: x,
      position_y: y,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(page: string, scrollPercentage: number) {
    analyticsService.trackEvent('scroll_depth', {
      page_name: page,
      scroll_percentage: scrollPercentage,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track video play
   */
  trackVideoPlay(videoId: string, videoTitle: string) {
    analyticsService.trackEvent('video_play', {
      video_id: videoId,
      video_title: videoTitle,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track custom event with arbitrary data
   */
  trackCustomEvent(eventName: string, eventData: Record<string, any>) {
    analyticsService.trackEvent(eventName, {
      ...eventData,
      session_id: this.sessionId,
      timestamp: Date.now(),
    });
  }
}

export const eventTrackingService = new EventTrackingService();
