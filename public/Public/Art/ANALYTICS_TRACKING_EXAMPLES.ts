/**
 * Quick Integration Guide for Analytics Tracking
 * Copy-paste examples for common use cases
 */

// ============================================
// 1. TRACK MARKETPLACE BROWSING
// ============================================

// In DiscoveryPage.tsx or Marketplace component
import { useEventTracking, usePageTracking } from '../hooks/useAnalytics';

export const DiscoveryPage = () => {
  usePageTracking('marketplace');
  const { trackSearch, trackFilterUsage } = useEventTracking();

  const handleSearch = (query: string) => {
    trackSearch(query, results.length, { category: 'all' });
  };

  const handleFilterChange = (filters: any) => {
    trackFilterUsage(filters);
  };

  // ... rest of component
};

// ============================================
// 2. TRACK NFT INTERACTIONS
// ============================================

// In NFTDetailPage.tsx
import { useEventTracking, usePageTracking } from '../hooks/useAnalytics';

export const NFTDetailPage = () => {
  usePageTracking('nft_detail');
  const { trackNFTView, trackWishlistAdd, trackOfferCreated } = useEventTracking();

  useEffect(() => {
    // Track NFT view on component mount
    trackNFTView(nft.id, nft.name, nft.price);
  }, [nft, trackNFTView]);

  const handleWishlistAdd = () => {
    trackWishlistAdd(nft.id, nft.name);
    // ... add to wishlist logic
  };

  const handleMakeOffer = (amount: number) => {
    trackOfferCreated(nft.id, amount);
    // ... create offer logic
  };

  return (
    <div>
      {/* Wishlist button */}
      <button onClick={handleWishlistAdd}>Add to Wishlist</button>
      
      {/* Make Offer button */}
      <button onClick={() => handleMakeOffer(50)}>Make Offer</button>
    </div>
  );
};

// ============================================
// 3. TRACK OFFERS & PURCHASES
// ============================================

// In OfferModal.tsx
import { useEventTracking } from '../hooks/useAnalytics';

export const OfferModal = ({ nft }) => {
  const { trackOfferCreated, trackOfferAccepted } = useEventTracking();

  const handleCreateOffer = async (amount: number) => {
    trackOfferCreated(nft.id, amount);
    // ... API call to create offer
  };

  const handleAcceptOffer = async (offerId: string) => {
    trackOfferAccepted(nft.id, offer.amount);
    // ... API call to accept offer
  };

  return (
    <div>
      <input onChange={(e) => handleCreateOffer(parseFloat(e.target.value))} />
      <button onClick={() => handleAcceptOffer(offerId)}>Accept</button>
    </div>
  );
};

// ============================================
// 4. TRACK USER AUTHENTICATION
// ============================================

// In AuthPage.tsx or Header.tsx
import { useEventTracking } from '../hooks/useAnalytics';

export const AuthComponent = () => {
  const { trackLogin, trackSignup, trackLogout } = useEventTracking();

  const handleLogin = (wallet: string) => {
    trackLogin(wallet, 'wallet_connect');
    // ... login logic
  };

  const handleSignup = (wallet: string) => {
    trackSignup(wallet);
    // ... signup logic
  };

  const handleLogout = (wallet: string) => {
    trackLogout(wallet);
    // ... logout logic
  };

  return (
    <div>
      <button onClick={() => handleLogin('0x123...')}>Connect Wallet</button>
      <button onClick={() => handleLogout('0x123...')}>Logout</button>
    </div>
  );
};

// ============================================
// 5. TRACK COLLECTIONS
// ============================================

// In CollectionsPage.tsx
import { useEventTracking, usePageTracking } from '../hooks/useAnalytics';

export const CollectionsPage = () => {
  usePageTracking('collections');
  const { trackCollectionView, trackCollectionAdd } = useEventTracking();

  const handleViewCollection = (collection: any) => {
    trackCollectionView(collection.id, collection.name, collection.items.length);
    // ... navigate to collection
  };

  const handleCreateCollection = (name: string) => {
    trackCollectionAdd('new_collection', name);
    // ... create collection logic
  };

  return (
    <div>
      {/* Collection list */}
      {collections.map(col => (
        <button key={col.id} onClick={() => handleViewCollection(col)}>
          {col.name}
        </button>
      ))}
    </div>
  );
};

// ============================================
// 6. TRACK CUSTOM EVENTS
// ============================================

// For any custom interaction
import { useEventTracking } from '../hooks/useAnalytics';

export const CustomComponent = () => {
  const { trackCustomEvent } = useEventTracking();

  const handleCustomAction = () => {
    trackCustomEvent('custom_interaction', {
      action: 'button_clicked',
      element: 'create_nft_button',
      metadata: {
        timestamp: Date.now(),
        page: 'create_page'
      }
    });
  };

  return <button onClick={handleCustomAction}>Custom Action</button>;
};

// ============================================
// 7. SET UP ANALYTICS DASHBOARD ACCESS
// ============================================

// Add link to header/navigation
import { Link } from 'react-router-dom';

export const Navigation = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/marketplace">Marketplace</Link>
      <Link to="/analytics-dashboard">📊 Analytics</Link>
    </nav>
  );
};

// ============================================
// 8. ENVIRONMENT SETUP
// ============================================

// .env.local
/*
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_URL=http://localhost:3001
*/

// ============================================
// 9. ACCESSING ANALYTICS DASHBOARD
// ============================================

// Navigate to: http://localhost:5173/analytics-dashboard

// Tabs available:
// - Overview: Key metrics, activity trends, top events
// - Funnel: Conversion funnel visualization
// - Behavior: User journey flow and engagement
// - Events: Custom event tracking details
// - Heatmap: Click heatmaps for pages

// ============================================
// 10. VERIFYING TRACKING WORKS
// ============================================

// 1. Check browser console for event logs
//    [GA] Google Analytics initialized: G-XXXXX

// 2. Check Google Analytics Realtime
//    https://analytics.google.com/analytics/web/

// 3. Check backend logs
//    curl http://localhost:3001/api/analytics/summary \
//      -H "Authorization: Bearer <token>"

// 4. Check database
//    SELECT COUNT(*) FROM analytics_events;
