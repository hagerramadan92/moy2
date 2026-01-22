 
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
		qualities: [75, 90],
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
   async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;