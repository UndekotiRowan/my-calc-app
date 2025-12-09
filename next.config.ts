/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:5328/api/:path*' // Points to local Python during testing
            : '/api/', // Points to Vercel Python in production
      },
    ];
  },
};

module.exports = nextConfig;