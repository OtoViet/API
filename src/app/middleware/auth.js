const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
require('dotenv').config();
const Account = require('../models/account');

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) res.sendStatus(401);
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, user) => {
        if(err) {
            let client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID 
            }).then(async (ticket) => {
                const payload = ticket.getPayload();
                req.user = {email: payload.email};
                next();
            }).catch(err => {
                console.log('co loi o middleware auth token het han');
                return res.sendStatus(403);
            });
        }
        else{
            req.user = user;
            next();
        }
    });
}
module.exports =verifyToken;