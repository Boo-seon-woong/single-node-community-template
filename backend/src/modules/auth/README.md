# auth module

Authentication and email verification.

## Endpoints
- `POST /auth/register`
- `GET /auth/verify?token=...`
- `POST /auth/login`

## Notes
- Register sends verification email.
- Login requires verified email.
- Verify endpoint redirects to `/verified.html` on success.

