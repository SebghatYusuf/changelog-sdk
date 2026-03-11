/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow Next.js to compile files from outside the project root (the SDK lib/)
  experimental: {
    externalDir: true,
  },

  // Transpile the linked SDK TypeScript source
  transpilePackages: ['changelog-sdk'],

  // mongodb/mongoose reference optional auth/compression packages at runtime.
  // Mark them as optional for bundling to avoid noisy module resolution errors in dev.
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      aws4: false,
      kerberos: false,
      snappy: false,
      socks: false,
      'gcp-metadata': false,
      '@mongodb-js/zstd': false,
      'mongodb-client-encryption': false,
    }
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      aws4: false,
      kerberos: false,
      snappy: false,
      socks: false,
      'gcp-metadata': false,
      '@mongodb-js/zstd': false,
      'mongodb-client-encryption': false,
    }
    return config
  },

  // Fix Turbopack workspace root detection (prevents false lockfile warnings)
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
