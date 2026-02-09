# css

Stylesheets for frontend pages.

## Files
- `theme.css`: global design tokens, base components
- `index.css`, `register.css`, `verified.css`: auth pages
- `main.css`, `newpost.css`, `post.css`: post flow pages
- `friend.css`, `chat.css`: social/chat pages
- `login.css`: legacy login styles (keep only if referenced)

## Rule of thumb
Put shared variables and primitives in `theme.css`, page-specific rules in per-page CSS.

