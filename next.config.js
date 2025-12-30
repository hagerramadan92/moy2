 
// const nextConfig = {
//   devIndicators: false,
//   reactStrictMode: false,
//   images: {
//     remotePatterns: [],
//   },
// };

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // تعطيل Turbopack
  experimental: {
    turbo: undefined
  }
};

module.exports = nextConfig;