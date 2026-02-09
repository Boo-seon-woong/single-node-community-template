// src/storage/users.storage.js
// NOTE: This file is now the SQLite persistence layer.
// It replaces JSON file read/write completely.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// DB file path (only this file knows it)
const DB_FILE = path.join(__dirname, '../../../db/app.db');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(DB_FILE);

const db = new Database(DB_FILE);

// Concurrency & safety defaults
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ---------- schema ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  verified_at INTEGER
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  time INTEGER NOT NULL,
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post_time ON comments(post_id, time);

CREATE TABLE IF NOT EXISTS chat_rooms (
  room_id TEXT PRIMARY KEY,
  user1 TEXT NOT NULL,
  user2 TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  text TEXT NOT NULL,
  time INTEGER NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_room_time ON chat_messages(room_id, time);

CREATE TABLE IF NOT EXISTS friends (
  owner TEXT NOT NULL,
  friend TEXT NOT NULL,
  last_message_time INTEGER,
  unread_count INTEGER NOT NULL DEFAULT 0,
  has_conversation INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(owner, friend)
);

CREATE INDEX IF NOT EXISTS idx_friends_owner_last ON friends(owner, last_message_time);
`);

// ---------- helpers ----------
function tx(fn) {
  const t = db.transaction(fn);
  return t();
}

function getRoomId(user1, user2) {
  return [user1, user2].sort().join('_');
}

// ---------- users ----------
function userFindByEmail(email) {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
}

function userExistsByEmailOrName(email, name) {
  const row = db.prepare(
    `SELECT 1 AS ok FROM users WHERE email = ? OR name = ? LIMIT 1`
  ).get(email, name);
  return !!row;
}

function userCreate({ email, name, passwordHash }) {
  db.prepare(`
    INSERT INTO users (email, name, password, verified, created_at, verified_at)
    VALUES (?, ?, ?, 0, ?, NULL)
  `).run(email, name, passwordHash, Date.now());
}

function userDeleteByEmail(email) {
  db.prepare(`DELETE FROM users WHERE email = ?`).run(email);
}

function userVerifyByEmail(email) {
  const info = db.prepare(`
    UPDATE users
    SET verified = 1, verified_at = ?
    WHERE email = ?
  `).run(Date.now(), email);

  return info.changes; // 0 or 1
}

// ---------- posts ----------
function postListAll() {
  // Return shape compatible with old frontend/service expectation:
  // [{id,name,title,text,cmt:[]}, ...]
  const posts = db.prepare(`
    SELECT id, name, title, text, created_at
    FROM posts
    ORDER BY created_at DESC
  `).all();

  // keep compatibility: attach cmt as empty array (comments fetched separately)
  return posts.map(p => ({ id: p.id, name: p.name, title: p.title, text: p.text, cmt: [] }));
}

function postGetById(id) {
  const post = db.prepare(`
    SELECT id, name, title, text, created_at
    FROM posts
    WHERE id = ?
  `).get(id);

  if (!post) return null;
  return { id: post.id, name: post.name, title: post.title, text: post.text, cmt: [] };
}

function postInsert({ id, name, title, text }) {
  db.prepare(`
    INSERT INTO posts (id, name, title, text, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, title, text, Date.now());
}

// ---------- comments ----------
function commentListByPostId(postId) {
  return db.prepare(`
    SELECT name, text, time
    FROM comments
    WHERE post_id = ?
    ORDER BY time ASC
  `).all(postId);
}

function commentInsert({ postId, name, text, time }) {
  // Ensure post exists (old code threw NOT_EXIST when post not found)
  const post = db.prepare(`SELECT 1 AS ok FROM posts WHERE id = ?`).get(postId);
  if (!post) {
    throw new Error('NOT_EXIST');
  }
  db.prepare(`
    INSERT INTO comments (post_id, name, text, time)
    VALUES (?, ?, ?, ?)
  `).run(postId, name, text, time);
}

// ---------- chat + friends (atomic) ----------
function chatGetMessages(myName, targetName) {
  const roomId = getRoomId(myName, targetName);

  const room = db.prepare(`SELECT room_id FROM chat_rooms WHERE room_id = ?`).get(roomId);
  if (!room) {
    return { roomId, messages: [] };
  }

  const messages = db.prepare(`
    SELECT from_name AS "from", to_name AS "to", text, time, read
    FROM chat_messages
    WHERE room_id = ?
    ORDER BY time ASC, id ASC
  `).all(roomId).map(m => ({ ...m, read: !!m.read }));

  return { roomId, messages };
}

function chatAppendMessageAndUpdateFriendIndex(myName, targetName, text) {
  const roomId = getRoomId(myName, targetName);
  const now = Date.now();

  return tx(() => {
    // room upsert
    db.prepare(`
      INSERT INTO chat_rooms (room_id, user1, user2, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(room_id) DO NOTHING
    `).run(roomId, myName, targetName, now);

    // insert message
    db.prepare(`
      INSERT INTO chat_messages (room_id, from_name, to_name, text, time, read)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(roomId, myName, targetName, text, now);

    // friend index upsert for both directions
    // 1) sender side: update last_message_time, has_conversation=1
    db.prepare(`
      INSERT INTO friends (owner, friend, last_message_time, unread_count, has_conversation)
      VALUES (?, ?, ?, 0, 1)
      ON CONFLICT(owner, friend) DO UPDATE SET
        last_message_time = excluded.last_message_time,
        has_conversation = 1
    `).run(myName, targetName, now);

    // 2) receiver side: increment unread_count
    db.prepare(`
      INSERT INTO friends (owner, friend, last_message_time, unread_count, has_conversation)
      VALUES (?, ?, ?, 1, 1)
      ON CONFLICT(owner, friend) DO UPDATE SET
        last_message_time = excluded.last_message_time,
        has_conversation = 1,
        unread_count = unread_count + 1
    `).run(targetName, myName, now);

    return {
      from: myName,
      to: targetName,
      text,
      time: now,
      read: false
    };
  });
}

function friendsList(owner) {
  return db.prepare(`
    SELECT friend AS name, last_message_time AS lastMessageTime, unread_count AS unreadCount
    FROM friends
    WHERE owner = ?
    ORDER BY COALESCE(last_message_time, 0) DESC
  `).all(owner);
}

function friendsAdd(owner, targetName) {
  // mimic old behavior: only create owner->target entry if missing
  db.prepare(`
    INSERT INTO friends (owner, friend, last_message_time, unread_count, has_conversation)
    VALUES (?, ?, NULL, 0, 0)
    ON CONFLICT(owner, friend) DO NOTHING
  `).run(owner, targetName);
}

function friendsMarkAsRead(owner, friendName) {
  const roomId = getRoomId(owner, friendName);

  return tx(() => {
    // mark read for messages from friendName -> owner
    db.prepare(`
      UPDATE chat_messages
      SET read = 1
      WHERE room_id = ? AND from_name = ? AND to_name = ?
    `).run(roomId, friendName, owner);

    // reset unread_count
    db.prepare(`
      UPDATE friends
      SET unread_count = 0
      WHERE owner = ? AND friend = ?
    `).run(owner, friendName);
  });
}

module.exports = {

  // sqlite operations
  userFindByEmail,
  userExistsByEmailOrName,
  userCreate,
  userDeleteByEmail,
  userVerifyByEmail,

  postListAll,
  postGetById,
  postInsert,

  commentListByPostId,
  commentInsert,

  chatGetMessages,
  chatAppendMessageAndUpdateFriendIndex,

  friendsList,
  friendsAdd,
  friendsMarkAsRead,
};
