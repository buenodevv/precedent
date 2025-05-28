/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["lh3.googleusercontent.com", "vercel.com"],
    domains: ['img.clerk.com']
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/steven-tey/precedent",
        permanent: false,           
      },
    ];
  },
};

module.exports = nextConfig;
