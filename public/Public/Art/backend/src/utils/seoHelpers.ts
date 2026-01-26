export const generateSitemap = (baseUrl: string = 'https://bitart.market') => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/discover', priority: '0.9', changefreq: 'daily' },
    { url: '/marketplace', priority: '0.9', changefreq: 'daily' },
    { url: '/create', priority: '0.8', changefreq: 'weekly' },
    { url: '/studio', priority: '0.7', changefreq: 'weekly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = (baseUrl: string = 'https://bitart.market') => {
  return `# BitArt Market Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml

# Google specific
User-agent: Googlebot
Allow: /

# Bing specific
User-agent: Bingbot
Allow: /

# Crawl-delay
Crawl-delay: 1`;
};
