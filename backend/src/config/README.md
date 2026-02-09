# config

Configuration layer.

## Files
- `env.js`
  - Loads `.env` via `dotenv`
  - Validates required keys
  - Exports normalized `env` object

- `mailer.js`
  - Builds Nodemailer transporter (Gmail setup)
  - Verifies SMTP at startup
  - Exports `sendVerificationEmail(toEmail, verifyLink)`

