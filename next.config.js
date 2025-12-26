/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['gateway.pinata.cloud', 'ipfs.io'],
  },
  env: {
    NEXT_PUBLIC_TALENT_PROTOCOL_API: process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API,
    NEXT_PUBLIC_IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud',
  },
};

module.exports = nextConfig;
