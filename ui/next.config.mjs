/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  async rewrites() {
    return [
      {
        source: '/networks',
        destination: process.env.API_URL ? `${process.env.API_URL}/networks` : 'http://localhost:4000/networks',
      },
      {
        source: '/connect',
        destination: process.env.API_URL ? `${process.env.API_URL}/connect` : 'http://localhost:4000/connect',
      },
    ];
  },
};

export default nextConfig; 