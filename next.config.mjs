/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    API: process.env.API,
    ADMIN_KEY: process.env.ADMIN_KEY,
    DOMAIN: process.env.DOMAIN,
    TAMIN_DOMAIN: process.env.TAMIN_DOMAIN,
    BACKEND: process.env.BACKEND,
    FILE_PATH: process.env.FILE_PATH,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", pathname: "**" },
    ],
  },
};

export default nextConfig;
