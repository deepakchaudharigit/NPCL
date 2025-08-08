/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Environment variables are now managed through config/env.ts
  // This provides better type safety and centralized configuration
}

module.exports = nextConfig