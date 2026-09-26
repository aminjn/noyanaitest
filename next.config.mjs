import { execSync } from "node:child_process";

// Seed from env (.env) so every machine produces the same chunk filenames and buildId.
const BUILD_SEED = (process.env.BUILD_SEED || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");

// buildId = seed + commit, so the same commit gives the same id everywhere,
// but a new release still gets a new /_next/static/<buildId>/ folder
// (those files are served as immutable, so the id must change per release).
function seededBuildId() {
  const commit =
    process.env.BUILD_COMMIT ||
    (() => {
      try {
        return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] })
          .toString()
          .trim();
      } catch {
        return "";
      }
    })();
  return commit ? `${BUILD_SEED}-${commit}` : BUILD_SEED;
}

// next/image only loads remote files from allowlisted hosts. Allow the host
// in FILE_PATH (e.g. https://ts.noyanai.com/files) next to the local default.
function fileHostPatterns() {
  const patterns = [{ protocol: "http", hostname: "127.0.0.1", pathname: "**" }];
  try {
    const url = new URL(process.env.FILE_PATH || "");
    patterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      ...(url.port && { port: url.port }),
      pathname: "**",
    });
  } catch {}
  return patterns;
}

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
    remotePatterns: fileHostPatterns(),
  },
  ...(BUILD_SEED && {
    generateBuildId: async () => seededBuildId(),
    webpack: (config, { dev }) => {
      if (!dev) {
        config.output.hashSalt = BUILD_SEED;
        config.optimization.moduleIds = "deterministic";
        config.optimization.chunkIds = "deterministic";
      }
      return config;
    },
  }),
};

export default nextConfig;
