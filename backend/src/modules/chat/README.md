# chat module

1:1 chat history and message persistence.

## Endpoint
- `GET /chat/messages/:targetName`

## Realtime
- WebSocket channel: `/ws/chat`
- Stores message, then pushes to sender and receiver sessions.
- Also triggers friend-notification events for `/ws/friend`.

