// PM2 config for the ts.noyanai.com frontend.
//   npm ci && npm run build && pm2 start deploy/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "noyanai-ts-front",
      cwd: __dirname + "/..",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3100 -H 127.0.0.1",
      env: { NODE_ENV: "production" },
      max_memory_restart: "1G",
    },
  ],
};
