const Account = require('../models/account');
const jwt = require('jsonwebtoken');
require('dotenv').config();
async function VerifyResetPassword(req, res, next) {
    try{
        const SECRET_KEY_EMAIL = process.env.SECRET_SEND_EMAIL;
        const { token } = req.body;
        jwt.verify(token, SECRET_KEY_EMAIL, async (err, user) => {
            if (err) {
                console.log(err);
                return res.status(403).json({ error: 'Token error' });
            }
            if(user) {
                req.user = user;
                next();
            }
        });   
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ error: 'loi verify token' });
    }
}
module.exports = VerifyResetPassword;