const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const {env} = require('../config/env')
function getToken(req) {
    const auth = req.headers.authorization;
    if(!auth) return null;
    const [type,token] = auth.split(' ');
    if(type !== 'Bearer') return null;
    return token;
}

function verify(token) {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch {
        throw new Error('UNAUTHORIZED');
    }
}

module.exports = {getToken, verify};