 
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
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;