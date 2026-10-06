// PM2 config for the ts.noyanai.com frontend.
//   npm ci && npm run build && pm2 start deploy/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "noyanai-ts-front",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100 -H 127.0.0.1",
      // Tehran time (Asia/Tehran): server-rendered dates read Tehran
      // through Components/helpers/tehranTime.ts whatever the zone; this
      // keeps any stray server-local date on Tehran too
      env: { NODE_ENV: "production", TZ: "Asia/Tehran" },
      max_memory_restart: "1G",
    },
  ],
};
