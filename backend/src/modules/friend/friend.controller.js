const friendService = require('./friend.service');
const { getToken } = require('../../storage/users.token');

exports.getFriends = async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(400).json({ error: 'missing token' });
    }

    const friends = await friendService.getFriends(token);
    return res.json({ friends });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const token = getToken(req);
    const friendName = req.params.friendName;

    if (!token || !friendName) {
      return res.status(400).json({ error: 'missing data' });
    }

    await friendService.markAsRead(token, friendName);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const token = getToken(req);
    const targetName = req.params.targetName;

    if (!token || !targetName) {
      return res.status(400).json({ error: 'missing data' });
    }

    await friendService.addFriend(token, targetName);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};
