// src/modules/comment/comment.service.js
const { verify } = require('../../storage/users.token');
const storage = require('../../storage/users.storage');

exports.getcomment = async (token, id) => {
  verify(token);
  // old code returned post.cmt (array)
  return storage.commentListByPostId(id);
};

exports.addcomment = async (token, id, text) => {
  const payload = verify(token);
  storage.commentInsert({
    postId: id,
    name: payload.name,
    text,
    time: Date.now(),
  });
};
