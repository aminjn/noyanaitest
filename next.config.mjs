/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: { API: process.env.API, ADMIN_KEY: process.env.ADMIN_KEY },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", pathname: "**" },
    ],
  },
};

export default nextConfig;
