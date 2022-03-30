const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const { mongooseToObject, mulMgToObject } = require('../../utils/mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const generateToken = (user) => {
    const email = user;
    //create token
    const accessToken = jwt.sign({ email }, process.env.JWT_ACCESS_TOKEN,
        { expiresIn: '30m' });
    const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_TOKEN,
        { expiresIn: '1h' });
    return { accessToken, refreshToken };
};

const updateRefreshToken = (name, refreshToken) => {
    console.log('refresh', refreshToken);
    Account.updateOne({ email: name }, { refreshToken })
        .then(() => {
            console.log('Update refresh token success');
        })
        .catch(err => {
            console.log(err);
        });

}
class AuthControllers {
    async SignUp(req, res) {
        const saltRounds = 10;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var fullName= firstName + ' ' + lastName;
        var password = req.body.password;
        var passwordHash = bcrypt.hashSync(password, saltRounds);
        password = await passwordHash;
        var email = req.body.email;
        var phoneNumber = req.body.phoneNumber;
        var dateOfBirth = req.body.dateOfBirth;
        var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT')
        console.log(dateFormatted, passwordHash);
        var formData = { firstName, lastName, fullName, password, email, phoneNumber, dateOfBirth: dateFormatted };
        const account = new Account(formData);
        account.save((err, account) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            res.status(201).json(mongooseToObject(account));
        });
        console.log(req.body);
    }
    async CheckExistAccount(req, res) {
        try {
            var existAccount = await Account.findOne({ email: req.body.email });
            if (existAccount) {
                return res.status(200).json({ exist: "Email đã tồn tại" });
            }
            return res.status(200).json({ err: null });
        }
        catch (err) {
            console.log(err);
        }
    }
    async CheckPassword(req, res) {
        try {
            const { password } = req.body;
            const user = await Account.findOne({ email: req.user.email });
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ result: false });
                }
                if (result) {
                    return res.status(200).json({ result: true });
                }
                return res.status(403).json({ result: false });
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    async Login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await Account.findOne({ email });
            let isMatch = null;
            if (user) {
                const truePassword = user.password;
                isMatch = await bcrypt.compare(password, truePassword);
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'user or password error' });
            }
            const token = await generateToken(email);
            updateRefreshToken(email, token.refreshToken);
            return res.status(200).json(token);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Login function error" });
        }
    }
    async LoginGoogle(req, res) {
        try {
            let user = await Account.findOne({ email: req.body.data.email });
            if (!user) {
                const account = new Account({
                    firstName: req.body.data.givenName,
                    lastName: req.body.data.familyName,
                    email: req.body.data.email,
                    fullName: req.body.data.name,
                });
                account.save((err, account) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    }
                    res.sendStatus(201);
                });
            }
            else {
                const token = await generateToken(user.email);
                updateRefreshToken(user.email, token.refreshToken);
                return res.status(200).json(token);
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Login google error" });
        }
    }
    async Token(req, res) {
        try {
            const { refreshToken } = await req.body;
            console.log(refreshToken);
            if (!refreshToken) return res.sendStatus(401);
            const user = await Account.findOne({ refreshToken: refreshToken });
            if (!user) {
                return res.sendStatus(403);
            }
            console.log('chu do token');
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, async (err, user) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(403);
                }
                console.log(user);
                const token = await generateToken(user.email);
                updateRefreshToken(user.email, token.refreshToken);
                return res.status(200).json(token);
            });
        }
        catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }
    }
    async Logout(req, res) {
        try{
            const user = await Account.findOne({ email: req.user.email });
            updateRefreshToken(user.email, null);
            return res.sendStatus(204);
        }
        catch (err) {
            console.log('co loi xay ra khi logout');
            return res.sendStatus(500);
        }
    }
    ForgotPassword(req, res) {
        const { email } = req.body;
        const SECRET_KEY_EMAIL = process.env.SECRET_SEND_EMAIL;
        let date = new Date();
        Account.findOne({ email }, async (err, account) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            if (!account) {
                return res.status(404).json({ error: 'Email not found' });
            }
            var mail = {
                "email": req.body.email,
                "created": date.toString()
            }
            const token_mail_verification = jwt.sign(mail, SECRET_KEY_EMAIL, { expiresIn: '1d' });
            let fronendHost = 'localhost:3000' || 'chamsocxeoto.tech';
            var url = req.protocol + '://' + fronendHost + "/passwordReset/" + token_mail_verification;

            //mailgun
            const DOMAIN = process.env.DOMAIN_MAILGUN;
            var api_key = process.env.API_KEY_MAILGUN;
            const mg = mailgun.client({ username: 'api', key: api_key });
            const data = {
                from: 'OtoViet <admin@otoviet.tech>',
                to: [req.body.email],
                subject: "Thay đổi mật khẩu tài khoản ",
                html: "<html><p>Để hoàn thành việc tạo mật khẩu mới cho tài khoản của bạn hãy nhấn <a href='" + url + "'" + ">Vào đây</a></p></html>",
            };
            mg.messages.create(DOMAIN, data)
                .then(msg => console.log(msg)) // logs response data
                .catch(err => console.log(err)); // logs any error

            return res.status(200).json({ message: 'Email sent' });
        });
    }
    async CheckTokenResetPassword(req, res) {
        try {
            const SECRET_KEY_EMAIL = process.env.SECRET_SEND_EMAIL;
            const { token } = req.body;
            jwt.verify(token, SECRET_KEY_EMAIL, async (err, user) => {
                if (err) {
                    console.log(err);
                    return res.status(403).json({ error: 'Token error' });
                }
                if (user) {
                    let checkUser = await Account.findOne({ email: user.email });
                    if(!checkUser){
                        return res.status(404).json({ error: 'User not found' });
                    }
                }
                return res.status(200).json({ message: 'Token valid' });
            });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ error: 'loi verify token' });
        }
    }
    async ResetPassword(req, res) {
        const password = req.body.password;
        const { email } = req.user;
        const hashedPassword = await bcrypt.hash(password, 10);
        let userUpdate = await Account.findOneAndUpdate({ email }, { password: hashedPassword });
        if (userUpdate) {
            console.log('update password thanh cong');
            return res.status(200).json({ message: 'Password changed' });
        }
        else {
            console.log('co loi xay ra khi update password')
            return res.status(500).json({ error: 'Password not changed' });
        }
    }
    ChangePassword(req, res) {
        const { email } = req.user;
        const { currentPassword, password } = req.body;
        Account.findOne({ email }, async (err, account) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error when change password' });
            }
            if (!account) {
                return res.status(404).json({ error: 'User not found' });
            }
            const validPassword = await bcrypt.compare(currentPassword, account.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Wrong password' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            let userUpdate = await Account.findOneAndUpdate({ email }, { password: hashedPassword });
            if (userUpdate) {
                console.log('update password thanh cong');
                return res.status(200).json({ message: 'Password changed' });
            }
            else {
                console.log('co loi xay ra khi update password')
                return res.status(500).json({ error: 'Password not changed' });
            }
        });
    }
}


module.exports = new AuthControllers();