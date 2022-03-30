const Account = require('../models/account');

async function checkAdmin(req, res, next) {
    const user = await Account.findOne({ email: req.user.email});
    if(user){
        if (user.roles !== 'admin') {
            return res.status(403).json({
                message: 'Only admin can access this route'
            });
        }
    }
    next();
}

module.exports = checkAdmin;