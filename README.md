# single_node_service

Single-node community service with:
- Express REST API + WebSocket backend
- Static HTML/CSS frontend
- SQLite database (`db/app.db`)

## Directory map
- `backend/`: server runtime and business logic
- `frontend/`: static client pages served by backend
- `db/`: SQLite files (persistent data)

## Run
From `single_node_service/backend`:

```bash
npm install
node src/server.js
```

By default backend serves frontend statically, so one process is enough.

