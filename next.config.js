/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://67e6-185-63-50-103.ngrok-free.app/:path*',
      },
    ]
  }
}

module.exports = nextConfig 