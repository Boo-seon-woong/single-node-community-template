# friend module

Friend list and unread-state helpers.

## Endpoints
- `GET /friend/list`
- `POST /friend/read/:friendName`
- `POST /friend/add/:targetName`

## Realtime
- WebSocket channel: `/ws/friend`
- Receives new-message notifications from chat module.

