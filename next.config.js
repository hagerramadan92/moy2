/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // أضف هذا السطر لحل مشكلة Turbopack
  experimental: {
    turbo: {}
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
  
  // إعدادات CORS
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
      {
        source: '/api/proxy/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  
  // إعدادات Rewrites
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://moya.talaaljazeera.com/api/v1/:path*',
      },
    ];
  },
  
  // إزالة إعدادات webpack أو تحويلها إلى turbopack
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       net: false,
  //       tls: false,
  //     };
  //   }
  //   return config;
  // },
};

module.exports = nextConfig;