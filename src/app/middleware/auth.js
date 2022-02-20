const jwt = require('jsonwebtoken');
require('dotenv').config();
const verifyToken = (req, res, next) => {
    const authHeader = req.header('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) res.sendStatus(401);
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
module.exports =verifyToken;