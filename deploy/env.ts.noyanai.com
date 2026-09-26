# Frontend env for https://ts.noyanai.com
# Copy to .env.local on the server (next.config inlines these at BUILD time,
# so rebuild after any change).

# Browser calls go same-origin; nginx proxies /api to the backend.
API=/api/v1

# Admin panel URL segment: https://ts.noyanai.com/<ADMIN_KEY>
# Not a secret (it ends up in the JS bundle) - just pick something non-obvious.
ADMIN_KEY=CHANGE_ME_admin_path

# Public origin of the site (sitemaps, canonical links, Tamin redirect).
DOMAIN=https://ts.noyanai.com

# Server-side (SSR / middleware / sitemap) calls go straight to the backend.
BACKEND=http://127.0.0.1:5100

# Uploaded files; nginx proxies /files/* to the backend's Public/ folder.
FILE_PATH=https://ts.noyanai.com/files

# Tamin OAuth (sandbox). Use the production host when going live.
TAMIN_DOMAIN=https://account-pilot.tamin.ir
