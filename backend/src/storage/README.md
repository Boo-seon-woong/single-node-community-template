# storage

Data and token utility layer.

## Files
- `users.storage.js`
  - SQLite schema creation and queries
  - Users, posts, comments, chat, friend index
  - DB path: `single_node_service/db/app.db`

- `users.token.js`
  - Extracts Bearer token from request headers
  - Verifies JWT with `env.JWT_SECRET`

## Note
Service modules should call this layer instead of direct SQL access.

