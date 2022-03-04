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
        { expiresIn: '30s' });
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

class AdminControllers {
    async CreateEmployeeAccount(req, res) {
        const saltRounds = 10;
        var role = 'employee';
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var password = req.body.password;
        var passwordHash = bcrypt.hashSync(password, saltRounds);
        password = await passwordHash;
        var email = req.body.email;
        var address = req.body.address;
        var phoneNumber = req.body.phoneNumber;
        var dateOfBirth = req.body.dateOfBirth;
        var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT')
        console.log(dateFormatted, passwordHash);
        var formData = { firstName, lastName, password, address,  email, phoneNumber, dateOfBirth: dateFormatted, roles: role };
        const account = new Account(formData);
        account.save((err, account) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            res.status(201).json(mongooseToObject(account));
        });
        console.log("Tao tai khoan nhan vien moi thanh cong");
    }
    async login(req, res){
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
            if(user.roles === 'admin'){
                const token = await generateToken(email);
                updateRefreshToken(email, token.refreshToken);
                return res.status(200).json(token);
            }
            else{
                return res.status(401).json({ error: 'user not administrator' });
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Login function error" });
        }
    }
    async CheckAdmin(req, res){
        res.status(200).json({ message: 'Check admin success' });
    }
    async GetAllEmployee(req, res){
        try{
            const employees = await Account.find({ roles: 'employee' });
            res.status(200).json(mulMgToObject(employees));
        }
        catch(err){
            console.log(err);
            res.status(500).json({ error: 'Get all employee error' });
        }
    }
}


module.exports = new AdminControllers();