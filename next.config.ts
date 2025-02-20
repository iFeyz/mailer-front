/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8080/api/:path*',
      },
    ];
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    return config;
  },
};

export default nextConfig;
