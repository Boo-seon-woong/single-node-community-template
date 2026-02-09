# modules

Feature modules and realtime hub.

## HTTP route mounts (from `app.js`)
- `/auth` -> `auth/`
- `/post` -> `post/`
- `/comment` -> `comment/`
- `/chat` -> `chat/`
- `/friend` -> `friend/`

## Realtime
- `websocket.js` handles:
  - `/ws/post`
  - `/ws/cmt`
  - `/ws/chat`
  - `/ws/friend`

