//src/modules/post/post.routes
const router = require('express').Router();
const controller = require('./post.controller');

router.get('/getposts',controller.getposts);
router.get('/getpost/:id',controller.getpost);
router.post('/addpost',controller.addpost);

module.exports = router;
