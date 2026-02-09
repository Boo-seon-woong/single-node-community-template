# comment module

Comment read and write for posts.

## Endpoints
- `GET /comment/getcomment/:id`
- `POST /comment/addcomment/:id` (HTTP fallback path)

## Realtime
- WebSocket channel: `/ws/cmt`
- Incoming comment events are broadcast to connected clients.

