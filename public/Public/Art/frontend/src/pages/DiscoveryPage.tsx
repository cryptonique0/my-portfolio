
import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store';
import { useQuery } from '@tanstack/react-query';
import { searchNFTs, SearchFilters, SearchResult, getTrendingNFTs } from '../services/search';
import { getTrendingByActivity } from '../services/activity';
import { ActivityFeed } from '../components/ActivityFeed';
import { NFTCard } from '../components/NFTCard';
import AdvancedFilters from '../components/AdvancedFilters';
import { engagementService, type LeaderboardEntry } from '../services/engagement';
import { engagementExtraService, type Quest, type SocialProofEvent } from '../services/engagement-extra';
import { marketplaceService } from '../services/api';

const DiscoveryPage: React.FC = () => {
  const { user } = useUserStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'popularity' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [socialProof, setSocialProof] = useState<SocialProofEvent[]>([]);
  const { data: trendingByActivity } = useQuery({
    queryKey: ['trendingByActivity', 9],
    queryFn: () => getTrendingByActivity(9)
  });

  useEffect(() => {
    engagementExtraService.getQuests().then(setQuests).catch(() => {});
    engagementExtraService.getSocialProof().then(setSocialProof).catch(() => {});
    loadTrending();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (query || filters.sortBy !== 'popularity' || filters.priceMin || filters.priceMax) {
      performSearch();
    }
    // eslint-disable-next-line
  }, [filters, page]);

  const loadTrending = async () => {
    try {
      const trendingNFTs = await getTrendingNFTs(10);
      setTrending(trendingNFTs);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await engagementService.getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await searchNFTs({ ...filters, query, page });
      setResults(response.results);
      setTotalResults(response.total);
    } catch (error) {
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  };
  const selectAll = () => setSelectedIds(results.map((n: SearchResult) => n.id));
  const clearAll = () => setSelectedIds([]);

  const handleBulkBuy = async () => {
    if (!selectedIds.length) return alert('Select NFTs to buy');
    if (!user.address) return alert('Connect your wallet to buy');
    setBulkLoading(true);
    try {
      const selectedNFTs = results.filter((nft: SearchResult) => selectedIds.includes(nft.id));
      const listingsResp = await marketplaceService.getListings(1, 1000);
      const listings = listingsResp.listings || [];
      const txs = [];
      for (const nft of selectedNFTs) {
        const listing = listings.find((l: any) => l.nftId?.toString() === nft.id?.toString() && l.status === 'active');
        if (listing) {
          const tx = await marketplaceService.buyNFT(listing.id, 1, user.address);
          txs.push(tx);
        }
      }
      alert(`Purchased ${txs.length} NFTs!`);
      clearAll();
    } catch (e) {
      alert('Bulk buy failed: ' + (e as any)?.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkList = async () => {
    if (!selectedIds.length) return alert('Select NFTs to list');
    if (!user.address) return alert('Connect your wallet to list');
    const priceStr = window.prompt('Enter price in ETH for all selected NFTs:');
    const price = parseFloat(priceStr || '0');
    if (!price || price <= 0) return alert('Invalid price');
    setBulkLoading(true);
    try {
      const txs = [];
      for (const id of selectedIds) {
        const nftId = Number(id);
        if (isNaN(nftId)) continue;
        const tx = await marketplaceService.createListing(nftId, price, 1, user.address);
        txs.push(tx);
      }
      alert(`Listed ${txs.length} NFTs!`);
      clearAll();
    } catch (e) {
      alert('Bulk list failed: ' + (e as any)?.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const hasMore = totalResults > results.length;

  return (
    <>
      {/* Quests Strip */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800 py-2 px-4 mb-6">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto text-sm text-amber-900 dark:text-amber-100">
          {quests.map((q) => (
            <span key={q.id} className="whitespace-nowrap font-semibold">
              {q.title}: <span className="text-amber-700 dark:text-amber-200">{q.progress}/{q.target}</span> <span className="text-xs">({Math.max(0, Math.floor((new Date(q.expiresAt).getTime() - Date.now())/3600000))}h left)</span>
            </span>
          ))}
          {quests.length === 0 && <span>No active quests</span>}
        </div>
      </div>
      {/* Social Proof Strip */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 py-2 px-4 mb-6">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto text-sm text-blue-900 dark:text-blue-100">
          {socialProof.map((e, i) => (
            <span key={i} className="whitespace-nowrap">{e.user.slice(0, 6)}... {e.action} <b>{e.nft}</b> <span className="text-xs text-gray-500">{e.time}</span></span>
          ))}
        </div>
      </div>
      {/* Bulk Actions Controls */}
      <div className="flex gap-2 mb-2">
        <button className="px-3 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold" onClick={selectAll}>Select All</button>
        <button className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold" onClick={clearAll}>Clear</button>
        <button className="px-3 py-1 rounded bg-blue-700 text-white text-xs font-semibold" onClick={handleBulkBuy} disabled={bulkLoading}>{bulkLoading ? 'Buying...' : 'Bulk Buy'}</button>
        <button className="px-3 py-1 rounded bg-purple-700 text-white text-xs font-semibold" onClick={handleBulkList} disabled={bulkLoading}>{bulkLoading ? 'Listing...' : 'Bulk List'}</button>
        <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
      </div>
      {/* ...existing code for filters, trending, search results, leaderboard, etc. should follow here ... */}
    </>
  );
};

export default DiscoveryPage;
