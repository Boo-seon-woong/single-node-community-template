require('dotenv').config();

function requireEnv(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_BASE_URL: requireEnv('APP_BASE_URL'),

  JWT_SECRET: requireEnv('JWT_SECRET'),
  VERIFY_SECRET: requireEnv('VERIFY_SECRET'),
  VERIFY_EXPIRES_MINUTES: parseInt(process.env.VERIFY_EXPIRES_MINUTES || '30', 10),

  MAIL_MODE: (process.env.MAIL_MODE || 'ethereal').toLowerCase(),
  MAIL_USER: process.env.MAIL_USER || '',
  MAIL_PASSWORD: process.env.MAIL_PASSWORD || '',
};

module.exports = { env, requireEnv };
