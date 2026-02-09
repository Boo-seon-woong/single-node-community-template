// src/modules/post/post.service.js
const { randomUUID } = require('crypto');
const { verify } = require('../../storage/users.token');
const storage = require('../../storage/users.storage');

exports.getposts = async (token) => {
  verify(token);
  return storage.postListAll();
};

exports.getpost = async (token, id) => {
  verify(token);
  return storage.postGetById(id);
};

exports.addpost = async (token, name, title, text) => {
  if (!token || !name || !text || !title) throw new Error('missing field');
  verify(token);

  const id = randomUUID();
  storage.postInsert({ id, name, title, text });
  return id;
};
