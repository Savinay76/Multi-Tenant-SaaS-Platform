const jwt = require('jsonwebtoken');

const signToken = (playload) => {
    return jwt.sign(playload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
};

const verifyToken = (token) =>{
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {signToken, verifyToken};