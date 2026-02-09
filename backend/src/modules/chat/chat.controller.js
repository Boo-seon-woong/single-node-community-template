const chatService = require('./chat.service');
const { getToken } = require('../../storage/users.token');

exports.getMessages = async (req, res) => {
  try {
    const token = getToken(req);
    const targetName = req.params.targetName;

    if (!token || !targetName) {
      return res.status(400).json({ error: 'missing data' });
    }

    const { messages, roomId } =
      await chatService.getMessages(token, targetName);

    return res.json({ messages, roomId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error' });
  }
};
