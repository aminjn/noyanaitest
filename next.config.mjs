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

// Site languages - keep in sync with Components/i18n/locales.ts. The page
// tree has no locale segment: "/en/doctors" is served by "/doctors" (the
// middleware reads the prefix and sets the x-locale header). The prefix is
// stripped here, by the router itself, rather than by a middleware rewrite:
// behind nginx (`X-Forwarded-Proto: https`, `next start -H 127.0.0.1`) Next
// 14 compares a middleware rewrite's origin (https://localhost:3100) with its
// own (https://127.0.0.1:3100), sees a mismatch, proxies the request to
// itself as an external URL over TLS and every "/<locale>/..." page was a
// 500 in production. Config rewrites have no origin, so no such check.
const LOCALES = ["fa", "en", "ar", "zh", "hi", "es", "fr", "ru", "pt", "de", "tr", "ur", "bn", "id", "ja"];
const LOCALE_PATTERN = LOCALES.join("|");

// Security headers on every page. No script-src CSP: maps, the payment
// gateway hand-off and the inline JSON-LD / theme scripts would need a
// nonce setup first; these directives restrict nothing the site uses.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // camera / microphone for calls and voice notes, location for "near me"
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(self), payment=(self), usb=(), serial=(), hid=(), browsing-topics=()",
  },
];
// No other site may frame a page (clickjacking on the panels, payment and
// OTP screens) - except the public CRM form /f/<slug>, which providers embed
// on their own sites with the <iframe> snippet from the CRM settings.
const NO_FRAME_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
];
const EMBEDDABLE_HEADERS = [{ key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'" }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: `/((?!f/|(?:${LOCALE_PATTERN})/f/).*)`, headers: NO_FRAME_HEADERS },
      { source: "/f/:slug*", headers: EMBEDDABLE_HEADERS },
      { source: `/:locale(${LOCALE_PATTERN})/f/:slug*`, headers: EMBEDDABLE_HEADERS },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: `/:locale(${LOCALE_PATTERN})`, destination: "/" },
        { source: `/:locale(${LOCALE_PATTERN})/:path*`, destination: "/:path*" },
      ],
    };
  },
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
  // The deploy script sets SKIP_BUILD_CHECKS=1: tsc and ESLint already run
  // before every merge, and running them again inside next build adds
  // minutes to each deploy. CHECKS=1 on the deploy turns them back on.
  typescript: { ignoreBuildErrors: process.env.SKIP_BUILD_CHECKS === "1" },
  // build workers: on a small server (deploy/arvan/setup.sh sets it) fewer
  // workers keep the build in RAM instead of swapping
  ...(Number(process.env.NEXT_BUILD_CPUS) > 0 && { experimental: { cpus: Number(process.env.NEXT_BUILD_CPUS) } }),
  eslint: { ignoreDuringBuilds: process.env.SKIP_BUILD_CHECKS === "1" },
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
