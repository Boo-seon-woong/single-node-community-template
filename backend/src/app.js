const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname,'../../frontend')));

app.use('/auth',require('./modules/auth/auth.routes'));
app.use('/post', require('./modules/post/post.routes'));
app.use('/comment', require('./modules/comment/comment.routes'));
app.use('/chat', require('./modules/chat/chat.routes'));
app.use('/friend', require('./modules/friend/friend.routes'));

module.exports = app;
