const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  output: 'standalone', // or just remove this line entirely
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
};


module.exports = nextConfig;
