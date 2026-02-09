# src

Backend source root.

## Main files
- `server.js`: creates HTTP server and mounts WebSocket server
- `app.js`: Express app, static serving, route mounts

## Subdirectories
- `config/`: env + mail setup
- `modules/`: domain modules and websocket handlers
- `storage/`: token helpers + SQLite data access

