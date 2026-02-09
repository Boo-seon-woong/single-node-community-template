const router = require('express').Router();
const controller = require('./friend.controller');

router.get('/list', controller.getFriends);
router.post('/read/:friendName', controller.markAsRead);
router.post('/add/:targetName', controller.addFriend);

module.exports = router;
