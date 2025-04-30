/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  compiler: {
    styledComponents: true,
  },
  // Ensure static files are properly handled in the export
  images: {
    unoptimized: true, // Required for static export
  },
  // Expose environment variables to the client
  env: {
    PORTAL_BRAND: process.env.PORTAL_BRAND,
  },
  // Removed the rewrites as these endpoints will be served by the backend directly
};

export default nextConfig; 