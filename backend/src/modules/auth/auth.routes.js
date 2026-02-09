const router = require('express').Router();
const controller = require('./auth.controller');

router.post('/register',controller.register);
router.get('/verify',controller.verifyEmail);
router.post('/login',controller.login);

module.exports = router;