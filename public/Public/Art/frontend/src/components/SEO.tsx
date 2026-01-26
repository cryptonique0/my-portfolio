import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = '/images/og-image.png',
  url,
  type = 'website',
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
}) => {
  const siteUrl = 'https://bitart.market';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title} | BitArt Market</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="BitArt Market" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@bitartmarket" />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
    </Helmet>
  );
};

// NFT Specific SEO Component
interface NFTSEOProps {
  nftName: string;
  description: string;
  imageUrl: string;
  creator: string;
  price?: number;
  tokenId: string;
}

export const NFTSEO: React.FC<NFTSEOProps> = ({
  nftName,
  description,
  imageUrl,
  creator,
  price,
  tokenId,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: nftName,
    description,
    image: imageUrl,
    brand: {
      '@type': 'Brand',
      name: creator,
    },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price,
        priceCurrency: 'ETH',
        availability: 'https://schema.org/InStock',
      },
    }),
  };

  return (
    <>
      <SEO
        title={nftName}
        description={description}
        image={imageUrl}
        url={`/nft/${tokenId}`}
        type="product"
        keywords={['NFT', 'Base', 'Blockchain', 'Digital Art', creator]}
        author={creator}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
    </>
  );
};
