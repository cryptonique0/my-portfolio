import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../utils/errors';

/**
 * Get sitemap.xml
 */
export const getSitemap = asyncHandler(async (req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL || 'https://bitart.market';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/discover</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/marketplace</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/create</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

/**
 * Get robots.txt
 */
export const getRobotsTxt = asyncHandler(async (req: Request, res: Response) => {
  const baseUrl = process.env.BASE_URL || 'https://bitart.market';
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

/**
 * Get manifest.json for PWA
 */
export const getManifest = asyncHandler(async (req: Request, res: Response) => {
  const manifest = {
    name: 'BitArt Market',
    short_name: 'BitArt',
    description: 'NFT Marketplace on Base Blockchain',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0052FF',
    icons: [
      {
        src: '/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  res.json(manifest);
});
