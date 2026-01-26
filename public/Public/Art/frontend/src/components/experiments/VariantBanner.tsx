import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { featureFlags } from '../../services/featureFlags';
import { analyticsService } from '../../services/google-analytics.service';

export const VariantBanner: React.FC = () => {
  const navigate = useNavigate();
  const variant = featureFlags.getFlag<string>('hero_variant', 'A');

  useEffect(() => {
    analyticsService.trackEvent('ab_test_assignment', {
      experiment: 'hero_variant',
      variant,
    });
  }, [variant]);

  const onCtaClick = () => {
    analyticsService.trackEvent('ab_test_click', {
      experiment: 'hero_variant',
      variant,
      cta: variant === 'A' ? 'Explore NFTs' : 'Start Creating',
    });
    navigate(variant === 'A' ? '/discover' : '/create');
  };

  if (variant === 'A') {
    return (
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Discover legendary NFTs on Base</h2>
            <p className="mt-1 text-indigo-100">Trending collections, verified creators, real-time analytics.</p>
          </div>
          <button onClick={onCtaClick} className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold shadow hover:shadow-lg">
            Explore NFTs
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Create, mint, and launch your collection</h2>
        <p className="mt-1 text-emerald-100">No-code tools, fair fees, creator-first royalties.</p>
        </div>
        <button onClick={onCtaClick} className="px-4 py-2 bg-white text-emerald-700 rounded-lg font-semibold shadow hover:shadow-lg">
          Start Creating
        </button>
      </div>
    </section>
  );
};
