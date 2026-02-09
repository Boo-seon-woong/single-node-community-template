// src/modules/chat/chat.routes.js
const router = require('express').Router();
const controller = require('./chat.controller');

router.get('/messages/:targetName', controller.getMessages);

module.exports = router;