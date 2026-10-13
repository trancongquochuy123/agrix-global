/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the original AgriX landing page (public/landing.html) as the home page.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
    };
  },
};

export default nextConfig;
