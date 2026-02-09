// src/modules/chat/chat.service.js
const { verify } = require('../../storage/users.token');
const storage = require('../../storage/users.storage');

/* 메시지 조회 */
exports.getMessages = async (token, targetName) => {
  const { name: myName } = verify(token);
  return storage.chatGetMessages(myName, targetName);
};

/* 메시지 추가 (room lazy-create + friend index update) */
exports.addMessage = async (token, targetName, text) => {
  const { name: myName } = verify(token);
  return storage.chatAppendMessageAndUpdateFriendIndex(myName, targetName, text);
};
