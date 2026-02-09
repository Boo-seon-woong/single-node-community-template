// src/modules/comment/comment.routes.js
const router = require('express').Router();
const controller = require('./comment.controller');

router.get('/getcomment/:id',controller.getcomment);
router.post('/addcomment/:id', controller.addcomment);

module.exports = router;
