const authService = require('./auth.service');

exports.register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'missing field' });
    }

    await authService.register(email, name, password);

    return res.status(201).json({success:true});
  } catch (err) {
    if (err.message === 'USER_EXISTS') return res.status(409).json({ error: 'user already exists' });
    if (err.message === 'MAIL_CREDENTIALS_NOT_SET') return res.status(500).json({ error: 'mail credentials not set' });
    if(err.message === 'EMAIL_FAILED') return res.status(500).json({error: 'you enter the wrong email'});
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'missing token' });

    await authService.verifyEmail(token);

    return res.redirect('/verified.html');
  } catch (err) {
    if (err.message === 'INVALID_TOKEN') return res.status(400).json({ error: 'invalid or expired token' });
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing field' });

    const result = await authService.login(email, password);
    return res.json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'invalid credentials' });
    if (err.message === 'EMAIL_NOT_VERIFIED') return res.status(403).json({ error: 'email not verified' });

    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};
