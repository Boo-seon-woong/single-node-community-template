# frontend

Static HTML frontend served by backend.

## Pages
- `index.html`: login
- `register.html`: signup
- `verified.html`: email verification success page
- `main.html`: post feed
- `newpost.html`: create post
- `post.html`: post detail + comments
- `friend.html`: friend list + add friend
- `chat.html`: 1:1 chat

## Client storage
Uses `localStorage` keys:
- `token`
- `name`
- `email`

## API/WS usage
- Calls backend routes under `/auth`, `/post`, `/comment`, `/chat`, `/friend`
- Uses WebSocket paths `/ws/post`, `/ws/cmt`, `/ws/chat`, `/ws/friend`

