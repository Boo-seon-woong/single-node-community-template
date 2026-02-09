// src/modules/friend/friend.service.js
const { verify } = require('../../storage/users.token');
const storage = require('../../storage/users.storage');

/* 친구 목록 조회 */
exports.getFriends = async (token) => {
  const { name: myName } = verify(token);
  return storage.friendsList(myName);
};

/* 읽음 처리 */
exports.markAsRead = async (token, friendName) => {
  const { name: myName } = verify(token);
  storage.friendsMarkAsRead(myName, friendName);
};

/* friend 추가 (메시지 가능 대상 등록) */
exports.addFriend = async (token, targetName) => {
  const { name: myName } = verify(token);
  if (myName === targetName) return;
  storage.friendsAdd(myName, targetName);
};
