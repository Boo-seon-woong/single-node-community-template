# post module

Post listing, detail, and creation.

## Endpoints
- `GET /post/getposts`
- `GET /post/getpost/:id`
- `POST /post/addpost` (HTTP fallback path)

## Realtime
- WebSocket channel: `/ws/post`
- New post messages are broadcast to connected clients.

