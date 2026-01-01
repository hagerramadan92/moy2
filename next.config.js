 
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
      {
        protocol: 'http',
        hostname: 'moya.talaaljazeera.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'moya.talaaljazeera.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;