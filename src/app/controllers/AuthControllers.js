const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const { mongooseToObject, mulMgToObject } = require('../../utils/mongoose');
const bcrypt = require('bcrypt');
 
let users = [
    { name: 'John', age: 20 },
    { name: 'Bob', age: 30 },
    { name: 'Kate', age: 25 },
    { name: 'Alex', age: 40 },
    { name: 'Jack', age: 35 }
];

const generateToken = (user) => {
    // console.log(user);
    const { email } = user;
    //create token
    const accessToken = jwt.sign({ email }, process.env.JWT_ACCESS_TOKEN,
        { expiresIn: '15s' });
    const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_TOKEN,
        { expiresIn: '1h' });
    return { accessToken, refreshToken };
};

const updateRefreshToken = (name, refreshToken) => {
    users = users.map(user => {
        if (user.name === name)
            return {
                ...user,
                refreshToken
            }
        return user
    })
}
class AuthControllers {
    async SignUp(req, res) {
        const saltRounds = 10;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var password = req.body.password;
        var passwordHash = bcrypt.hashSync(password, saltRounds);
        password = await passwordHash;
        var email = req.body.email;
        var phoneNumber = req.body.phoneNumber;
        var dateOfBirth = req.body.dateOfBirth;
        var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT')
        console.log(dateFormatted, passwordHash);
        var formData = { firstName, lastName, password, email, phoneNumber, dateOfBirth: dateFormatted };
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
        try{
            var existAccount = await Account.findOne({ email: req.body.email });
            if(existAccount){
                return res.status(200).json({exist: "Email đã tồn tại"});
            }
            return res.status(200).json({err: null});
        }
        catch(err){
            console.log(err);
        }
    }
    async Login(req, res) {
        try{
            const { email, password } = req.body;
            const user = await Account.findOne({ email });
            let isMatch = null;
            if(user) {
                const truePassword = user.password;
                isMatch = await bcrypt.compare(password, truePassword);
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'user or password error' });
            }
            const token = generateToken(user);
            updateRefreshToken(email, token.refreshToken);
            return res.status(200).json(token);
        }
        catch(err){
            console.log(err);
        }
    }
    Token(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.sendStatus(401);
        const user = users.find(u => u.refreshToken === refreshToken);
        console.log(user);
        if (!user) {
            return res.status(403);
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            const token = generateToken(user);
            updateRefreshToken(user.name, token.refreshToken);
            res.json(token);
        });
    }
    async Logout(req, res) {
        const user = await Account.findOne({ email: req.user.email });
        console.log(user);
        updateRefreshToken(user.email, null);
        return res.sendStatus(204);
    }
}


module.exports = new AuthControllers();