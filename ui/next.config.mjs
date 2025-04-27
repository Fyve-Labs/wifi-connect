/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  compiler: {
    styledComponents: true,
  },
  // Removed the rewrites as these endpoints will be served by the backend directly
};

export default nextConfig; 