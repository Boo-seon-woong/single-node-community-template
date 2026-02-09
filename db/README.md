# db

SQLite data directory.

## Files
- `app.db`: main database file
- `app.db-wal`: write-ahead log (generated at runtime)
- `app.db-shm`: shared memory file for WAL mode (generated at runtime)

## Notes
- Managed by backend storage layer (`backend/src/storage/users.storage.js`)
- Do not edit these files manually while server is running.

