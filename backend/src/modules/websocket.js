// src/modules/websocket.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const postService = require('./post/post.service');
const commentService = require('./comment/comment.service');
const chatService = require('./chat/chat.service');
const {env} = require('../config/env');

/* =========================
   공통 유틸
========================= */
function addClient(clients, name, ws) {
    if (!clients.has(name)) {
        clients.set(name, new Set());
    }
    clients.get(name).add(ws);
}

function removeClient(clients, name, ws) {
    if (!clients.has(name)) return;
    const set = clients.get(name);
    set.delete(ws);
    if (set.size === 0) {
        clients.delete(name);
    }
}

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });

    // Map<name, Set<WebSocket>>
    const postClients = new Map();
    const commentClients = new Map();
    const chatClients = new Map();
    const friendClients = new Map();

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname;
        const token = url.searchParams.get('token');

        console.log('WebSocket connection attempt:', path);

        let name, email;
        try {
            const payload = jwt.verify(token, env.JWT_SECRET);
            name = payload.name;
            email = payload.email;
        } catch (err) {
            console.error('WS auth failed:', err.message);
            if(err.message === 'jwt expired') {
                ws.close(4001, 'TOKEN_EXPIRED');
                return;
            }
            ws.close(1008, 'Authentication failed');
            return;
        }

        if (path === '/ws/post') {
            handlePostConnection(ws, name, token, postClients);
        } else if (path === '/ws/cmt') {
            handleCommentConnection(ws, name, token, commentClients);
        } else if (path === '/ws/chat') {
            handleChatConnection(ws, name, token, chatClients, friendClients);
        } else if (path === '/ws/friend') {
            handleFriendConnection(ws, name, friendClients);
        } else {
            console.log('Unknown path:', path);
            ws.close(1008, 'Unknown path');
        }
    });

    console.log('Unified WebSocket server initialized');
};

/* =========================
   Post WS
========================= */
function handlePostConnection(ws, name, token, clients) {
    addClient(clients, name, ws);
    console.log('Post WS connected:', name, '| Users:', clients.size);

    ws.on('message', async (raw) => {
        try {
            const { title, text } = JSON.parse(raw.toString());
            if (!title || !text) {
                ws.send(JSON.stringify({ error: 'Missing title or text' }));
                return;
            }

            const id = await postService.addpost(token, name, title, text);
            console.log('New post created:', id, 'by', name);

            const message = JSON.stringify({ name, title, id });

            for (const [, wsSet] of clients.entries()) {
                for (const clientWs of wsSet) {
                    if (clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(message);
                    }
                }
            }
        } catch (err) {
            console.error('Post WS error:', err);
            ws.send(JSON.stringify({ error: 'Failed to create post' }));
        }
    });

    ws.on('close', () => {
        removeClient(clients, name, ws);
        console.log('Post WS disconnected:', name);
    });
}

/* =========================
   Comment WS
========================= */
function handleCommentConnection(ws, name, token, clients) {
    addClient(clients, name, ws);
    console.log('Comment WS connected:', name, '| Users:', clients.size);

    ws.on('message', async (raw) => {
        try {
            const { id, text } = JSON.parse(raw.toString());
            if (!id || !text) {
                ws.send(JSON.stringify({ error: 'Missing id or text' }));
                return;
            }

            await commentService.addcomment(token, id, text);
            console.log('New comment on post', id, 'by', name);

            const message = JSON.stringify({
                postId: id,
                name,
                text,
                time: Date.now()
            });

            for (const [, wsSet] of clients.entries()) {
                for (const clientWs of wsSet) {
                    if (clientWs.readyState === WebSocket.OPEN) {
                        clientWs.send(message);
                    }
                }
            }
        } catch (err) {
            console.error('Comment WS error:', err);
            ws.send(JSON.stringify({ error: 'Failed to add comment' }));
        }
    });

    ws.on('close', () => {
        removeClient(clients, name, ws);
        console.log('Comment WS disconnected:', name);
    });
}

/* =========================
   Chat WS
========================= */
function handleChatConnection(ws, name, token, chatClients, friendClients) {
    addClient(chatClients, name, ws);
    console.log('Chat WS connected:', name, '| Users:', chatClients.size);

    ws.on('message', async (raw) => {
        try {
            const { targetName, text } = JSON.parse(raw.toString());
            if (!targetName || !text) {
                ws.send(JSON.stringify({ error: 'Missing targetName or text' }));
                return;
            }

            const message = await chatService.addMessage(token, targetName, text);
            console.log('Chat message from', name, 'to', targetName);

            // 발신자 (모든 기기)
            const senderSet = chatClients.get(name);
            if (senderSet) {
                for (const sWs of senderSet) {
                    if (sWs.readyState === WebSocket.OPEN) {
                        sWs.send(JSON.stringify(message));
                    }
                }
            }

            // 수신자 (모든 기기)
            const targetSet = chatClients.get(targetName);
            if (targetSet) {
                for (const tWs of targetSet) {
                    if (tWs.readyState === WebSocket.OPEN) {
                        tWs.send(JSON.stringify(message));
                    }
                }
            }

            // friend 알림
            const friendSet = friendClients.get(targetName);
            if (friendSet) {
                for (const fWs of friendSet) {
                    if (fWs.readyState === WebSocket.OPEN) {
                        fWs.send(JSON.stringify({
                            type: 'new_message',
                            from: name
                        }));
                    }
                }
            }
        } catch (err) {
            console.error('Chat WS error:', err);
            ws.send(JSON.stringify({ error: 'Failed to send message' }));
        }
    });

    ws.on('close', () => {
        removeClient(chatClients, name, ws);
        console.log('Chat WS disconnected:', name);
    });
}

/* =========================
   Friend WS
========================= */
function handleFriendConnection(ws, name, clients) {
    addClient(clients, name, ws);
    console.log('Friend WS connected:', name, '| Users:', clients.size);

    ws.on('close', () => {
        removeClient(clients, name, ws);
        console.log('Friend WS disconnected:', name);
    });
}
