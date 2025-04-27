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
  // Removed the rewrites as these endpoints will be served by the backend directly
};

export default nextConfig; 