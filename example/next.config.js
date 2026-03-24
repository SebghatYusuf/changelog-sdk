const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['mongodb', 'mongoose'],
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'changelog-sdk$': path.resolve(__dirname, '../dist/esm/index.js'),
      'changelog-sdk/next$': path.resolve(__dirname, '../dist/esm/next/index.js'),
      'changelog-sdk/styles$': path.resolve(__dirname, '../dist/styles/changelog-ui.css'),
    }

    return config
  },
}

module.exports = nextConfig
