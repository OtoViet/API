const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const { mongooseToObject,mulMgToObject } = require('../../utils/mongoose');
let users = [
    { name: 'John', age: 20 },
    { name: 'Bob', age: 30 },
    { name: 'Kate', age: 25 },
    { name: 'Alex', age: 40 },
    { name: 'Jack', age: 35 }
];

const generateToken = (user) => {
    const { name } = user;
    //create token
    const accessToken = jwt.sign({ name }, process.env.JWT_ACCESS_TOKEN,
        { expiresIn: '15s' });
    const refreshToken = jwt.sign({ name }, process.env.JWT_REFRESH_TOKEN,
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
    SignUp(req, res) {
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var password = req.body.password;
        var email = req.body.email;
        var phoneNumber = req.body.phoneNumber;
        var dateOfBirth = req.body.dateOfBirth;
        console.log(dateOfBirth);
        var formData = {firstName, lastName, password, email, phoneNumber, dateOfBirth};
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
    Login(req, res) {
        const { name } = req.body;
        const user = users.find(u => u.name === name);
        if (!user) {
            res.status(400).json({ error: 'user not found' });
        }
        const token = generateToken(user);
        updateRefreshToken(name, token.refreshToken);
        res.json(token);
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
    Logout(req, res) {
        const user = users.find(el => el.name == req.user.name);
        console.log(user);
        updateRefreshToken(user.name, null);
        res.sendStatus(204);
    }
}


module.exports = new AuthControllers();