//src/modules/post/post.controller.js
const postService = require('./post.service');
const { getToken, verify } = require('../../storage/users.token');

exports.getposts = async (req,res) => {
    try{
        const token = getToken(req);
        if(!token) return res.status(400).json({error:'missing data'});
        const posts = await postService.getposts(token);
        return res.json({posts});
    } catch(err){
        console.error(err);
        return res.status(500).json({error:'internal error'});
    }
}

exports.getpost = async (req,res) => {
    try{
        const token = getToken(req);
        const id = req.params.id;
        if(!token || !id) return res.status(400).json({error:'missing data'});
        const post = await postService.getpost(token,id);
        return res.json({post});
    } catch(err){
        console.error(err);
        return res.status(500).json({error:'internal error'});
    }
}

exports.addpost = async (req, res) => {
    try {
        const token = getToken(req);
        const { title, text } = req.body;
        if (!token || !title || !text) return res.status(400).json({ error: 'missing data' });

        const { name } = verify(token);
        const id = await postService.addpost(token, name, title, text);
        return res.json({ id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'internal error' });
    }
};
