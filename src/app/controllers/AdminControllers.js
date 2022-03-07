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

class AdminControllers {
    async CreateEmployeeAccount(req, res) {
        try{
            var image = req.body.image;
            console.log(image);
            const saltRounds = 10;
            var role = 'employee';
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var fullName= firstName + ' ' + lastName;
            var password = req.body.password;
            var passwordHash = bcrypt.hashSync(password, saltRounds);
            password = await passwordHash;
            var email = req.body.email;
            var address = req.body.address;
            var phoneNumber = req.body.phoneNumber;
            var dateOfBirth = req.body.dateOfBirth;
            var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT')
            console.log(dateFormatted, passwordHash);
            var formData = { firstName, lastName, fullName, image, password, address,  email, phoneNumber, dateOfBirth: dateFormatted, roles: role };
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
        catch(err){
            console.log(err);
            res.status(500).json({ error: 'Create employee account error' });
        }
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
    GetEmployee(req, res){
        try{
            const id = req.params.id;
            Account.findById(id, (err, account) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Get employee by id error' });
                }
                console.log('lay thong tin nhan vien thanh cong');
                res.status(200).json(mongooseToObject(account));
            });
        }
        catch(err){
            console.log(err);
            res.status(500).json({ error: 'Get employee by id error' });
        }
    }
    DeleteEmployee(req, res){
        try{
            const id = req.params.id;
            Account.findByIdAndDelete(id, (err, account) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Delete employee error' });
                }
                console.log('xoa tai khoan thanh cong');
                res.status(200).json(mongooseToObject(account));
            });
        }
        catch(err){
            console.log(err);
            res.status(500).json({ error: 'Delete employee error' });
        }
    }
    UpdateInfoEmployee(req, res){
        try{
            const id = req.params.id;
            const formData = req.body;
            let fullName = req.body.firstName + ' ' + req.body.lastName;
            var dateOfBirth = req.body.dateOfBirth;
            var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT');
            formData.dateOfBirth = dateFormatted;
            formData.fullName = fullName;
            Account.findByIdAndUpdate(id, formData, {new: true}, (err, account) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Update info employee error' });
                }
                console.log('cap nhat thong tin thanh cong');
                res.status(200).json(mongooseToObject(account));
            });
        }
        catch(err){
            console.log(err);
            res.status(500).json({ error: 'Update info employee error' });
        }
    }
}


module.exports = new AdminControllers();