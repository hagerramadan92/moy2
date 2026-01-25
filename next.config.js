/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // إعدادات Turbopack
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
  
  // إعدادات CORS أكثر شمولية
  async headers() {
    return [
      {
        // CORS headers لجميع المسارات
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/api/moya/:path*',
        headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  
  // إعدادات Rewrites أكثر تحديداً
  async rewrites() {
    return [
      {
        source: '/api/moya/:path*',
        destination: 'https://moya.talaaljazeera.com/api/v1/:path*',
      },
      // إضافة rewrite إضافي للطريق المباشر
      {
        source: '/api/v1/:path*',
        destination: 'https://moya.talaaljazeera.com/api/v1/:path*',
      },
    ];
  },
  
  // إعدادات لتحسين الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // إعدادات لتحميل الملفات الكبيرة
  experimental: {
    turbo: {},
    serverComponentsExternalPackages: ['axios', 'react-icons'],
  },
  
  // إعدادات لتحسين أمان الطلبات
  async redirects() {
    return [
      {
        source: '/api/v1/notifications',
        destination: '/api/moya/notifications',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;