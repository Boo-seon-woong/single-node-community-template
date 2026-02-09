# backend

Node.js backend for `single_node_service`.

## What it does
- Serves static files from `../frontend`
- Exposes REST APIs for auth/post/comment/chat/friend
- Hosts WebSocket channels for realtime updates
- Uses SQLite via `better-sqlite3`

## Required env vars
Defined in `.env` and loaded by `src/config/env.js`:
- `APP_BASE_URL`
- `JWT_SECRET`
- `VERIFY_SECRET`
- `VERIFY_EXPIRES_MINUTES` (optional, default `30`)
- `MAIL_MODE` (optional)
- `MAIL_USER`
- `MAIL_PASSWORD`
- `PORT` (optional, default `3000`)

## Run
```bash
npm install
node src/server.js
```

