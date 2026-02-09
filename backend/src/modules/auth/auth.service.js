// src/modules/auth/auth.service.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const storage = require('../../storage/users.storage');
const { sendVerificationEmail } = require('../../config/mailer');

function signVerifyToken(email) {
  return jwt.sign(
    { email },
    env.VERIFY_SECRET,
    { expiresIn: `${env.VERIFY_EXPIRES_MINUTES}m` }
  );
}

exports.register = async (email, name, password) => {
  const exist = storage.userExistsByEmailOrName(email, name);
  if (exist) throw new Error('USER_EXISTS');

  const hash = await bcrypt.hash(password, 10);

  storage.userCreate({ email, name, passwordHash: hash });

  const token = signVerifyToken(email);
  const link = `${env.APP_BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`;

  try {
    await sendVerificationEmail(email, link);
  } catch (err) {
    // rollback best-effort
    storage.userDeleteByEmail(email);
    throw err;
  }
};

exports.verifyEmail = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, env.VERIFY_SECRET);
  } catch {
    // keep original style (your code had 'INVALID TOKEN' here)
    throw new Error('INVALID TOKEN');
  }

  const user = storage.userFindByEmail(payload.email);
  if (!user) throw new Error('INVALID_TOKEN');

  if (!user.verified) {
    storage.userVerifyByEmail(payload.email);
  }

  const updated = storage.userFindByEmail(payload.email);
  return { email: updated.email, verified: !!updated.verified };
};

exports.login = async (email, password) => {
  const user = storage.userFindByEmail(email);
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('INVALID CREDENTIALS');

  if (!user.verified) throw new Error('EMAIL_NOT_VERIFIED');

  const token = jwt.sign(
    { email: user.email, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, email: user.email, name: user.name };
};
