//src/modules/comment/comment.controller.js
const commentService = require('./comment.service');
const {getToken} = require('../../storage/users.token');


exports.getcomment = async (req,res) => {
    try{
        const id = req.params.id;
        const token = getToken(req);
        if(!id || !token) return res.status(400).json({error:'missing data'});
        const comments = await commentService.getcomment(token,id);
        return res.json({comments});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error:'internal error'});
    }
}

exports.addcomment = async (req, res) => {
    try {
        const id = req.params.id;
        const token = getToken(req);
        const { text } = req.body;
        if (!id || !token || !text) return res.status(400).json({ error: 'missing data' });

        await commentService.addcomment(token, id, text);
        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'internal error' });
    }
};
