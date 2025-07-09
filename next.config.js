const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  output: 'standalone', // Keep if needed for your deployment
  experimental: {
    outputFileTracingRoot: process.cwd(), // Points to linkadev (repo root)
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