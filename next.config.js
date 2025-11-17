/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Fix for pdfjs-dist and canvas on server
    if (isServer) {
      config.resolve.alias.canvas = false;
    }
    return config;
  },
}

module.exports = nextConfig
