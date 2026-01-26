import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './store';
import { Header } from './components/Header';
import { VariantBanner } from './components/experiments/VariantBanner';
import { useLocation } from 'react-router-dom';
import { NotificationContainer } from './components/Notification';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { NFTDetailPage } from './pages/NFTDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import DiscoveryPage from './pages/DiscoveryPage';
import RoyaltiesDashboard from './pages/RoyaltiesDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { StudioPage } from './pages/StudioPage';
import AuthPage from './pages/Auth';
import AnalyticsPage from './pages/Analytics';
import AdminDashboard from './pages/Admin';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import WishlistPage from './pages/WishlistPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import BulkOperations from './pages/BulkOperations';
import { UIShowcase } from './pages/UIShowcase';
import NFTDisplayShowcase from './pages/NFTDisplayShowcase';
import GamificationDashboard from './pages/GamificationDashboard';
import { MintNFT } from './components/MintNFT';
import { AuctionSystem } from './components/AuctionSystem';
import { TransactionTracker } from './components/TransactionTracker';
import { EventFeed } from './components/EventFeed';

function App() {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    // Apply theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className={isDarkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <Header />
            {location.pathname === '/' && <VariantBanner />}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/nft/:id" element={<NFTDetailPage />} />
              <Route path="/profile/:address" element={<ProfilePage />} />
              <Route path="/creator/:address" element={<CreatorProfilePage />} />
              <Route path="/royalties/:address" element={<RoyaltiesDashboard />} />
              <Route path="/discover" element={<DiscoveryPage />} />
              <Route path="/marketplace" element={<DiscoveryPage />} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/transaction-history" element={<TransactionHistoryPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
              <Route path="/bulk-operations" element={<BulkOperations />} />
              <Route path="/ui-showcase" element={<UIShowcase />} />
                            <Route path="/nft-display" element={<NFTDisplayShowcase />} />
            <Route path="/gamification" element={<GamificationDashboard />} />
              <Route path="/mint" element={<MintNFT />} />
              <Route path="/auctions" element={<AuctionSystem />} />
              <Route path="/transactions" element={<TransactionTracker />} />
              <Route path="/events" element={<EventFeed />} />
            </Routes>
            <NotificationContainer />
          </div>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
