const jwt = require('jsonwebtoken');
const Orders = require('../models/orders');
const Account = require('../models/account');
const Store = require('../models/storeList');
const Products = require('../models/products');
const Discount = require('../models/discount');
const Notification = require('../models/notify');
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
//employees
class AdminControllers {
    async CreateEmployeeAccount(req, res) {
        try {
            var image = req.body.image;
            console.log(image);
            const saltRounds = 10;
            var role = 'employee';
            var firstName = req.body.firstName;
            var lastName = req.body.lastName;
            var fullName = firstName + ' ' + lastName;
            var password = req.body.password;
            var passwordHash = bcrypt.hashSync(password, saltRounds);
            password = await passwordHash;
            var email = req.body.email;
            var address = req.body.address;
            var phoneNumber = req.body.phoneNumber;
            var dateOfBirth = req.body.dateOfBirth;
            var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT')
            console.log(dateFormatted, passwordHash);
            var formData = { firstName, lastName, fullName, image, password, address, email, phoneNumber, dateOfBirth: dateFormatted, roles: role };
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
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Create employee account error' });
        }
    }
    async login(req, res) {
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
            if (user.roles === 'admin') {
                const token = await generateToken(email);
                updateRefreshToken(email, token.refreshToken);
                return res.status(200).json(token);
            }
            else {
                return res.status(401).json({ error: 'user not administrator' });
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Login function error" });
        }
    }
    CheckAdmin(req, res) {
        return res.status(200).json({ message: 'Check admin success' });
    }
    async GetAllEmployee(req, res) {
        try {
            const employees = await Account.find({ roles: 'employee' });
            res.status(200).json(mulMgToObject(employees));
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Get all employee error' });
        }
    }
    GetEmployee(req, res) {
        try {
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
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Get employee by id error' });
        }
    }
    DeleteEmployee(req, res) {
        try {
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
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Delete employee error' });
        }
    }
    UpdateInfoEmployee(req, res) {
        try {
            const id = req.params.id;
            const formData = req.body;
            let fullName = req.body.firstName + ' ' + req.body.lastName;
            var dateOfBirth = req.body.dateOfBirth;
            var dateFormatted = new Date(dateOfBirth).toLocaleDateString('pt-PT');
            formData.dateOfBirth = dateFormatted;
            formData.fullName = fullName;
            Account.findByIdAndUpdate(id, formData, { new: true }, (err, account) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Update info employee error' });
                }
                console.log('cap nhat thong tin thanh cong');
                res.status(200).json(mongooseToObject(account));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Update info employee error' });
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //products

    AddNewProduct(req, res) {
        try {
            const formData = req.body;
            const product = new Products(formData);
            product.save((err, product) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Add new product error' });
                }
                console.log('them san pham thanh cong');
                res.status(201).json(mongooseToObject(product));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Add new product error' });
        }
    }
    async GetAllProduct(req, res) {
        try {
            const products = await Products.find({});
            if (products) res.status(200).json(mulMgToObject(products));
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Get all product error' });
        }
    }
    GetProductById(req, res) {
        Products.findById(req.params.id, (err, product) => {
            if (err) res.status(404).json({ error: 'Not found product by id' });
            res.status(200).json(mongooseToObject(product));
        }).populate("infoUserComment","fullName phoneNumber").exec();
    }
    UpdateProduct(req, res) {
        try {
            const id = req.params.id;
            const formData = req.body;
            Products.findByIdAndUpdate(id, formData, { new: true }, (err, product) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Update product error' });
                }
                console.log('cap nhat san pham thanh cong');
                res.status(200).json(mongooseToObject(product));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Update product error' });
        }
    }
    DeleteProduct(req, res) {
        try {
            const id = req.params.id;
            Products.findByIdAndDelete(id, (err, product) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Delete product error' });
                }
                console.log('xoa san pham thanh cong');
                res.status(200).json(mongooseToObject(product));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Delete product error' });
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //store
    CreateStore(req, res) {
        try {
            const formData = req.body;
            const store = new Store(formData);
            store.save((err, store) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Create store error' });
                }
                console.log('tao cua hang moi thanh cong');
                res.status(201).json(mongooseToObject(store));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Create store error' });
        }
    }
    async GetAllStore(req, res) {
        try {
            const stores = await Store.find({});
            if (stores) res.status(200).json(mulMgToObject(stores));
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Get all store error' });
        }
    }
    UpdateStore(req, res) {
        try {
            const id = req.params.id;
            const formData = req.body;
            Store.findByIdAndUpdate(id, formData, { new: true }, (err, store) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Update store error' });
                }
                console.log('cap nhat thong tin cua hang thanh cong');
                res.status(200).json(mongooseToObject(store));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Update store error' });
        }
    }
    DeleteStore(req, res) {
        try {
            const id = req.params.id;
            Store.findByIdAndDelete(id, (err, store) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Delete store error' });
                }
                console.log('xoa cua hang thanh cong');
                res.status(200).json(mongooseToObject(store));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Delete store error' });
        }
    }
    Statistical(req, res) {
        Orders.find({ isCompleted: true })
            .then(data => {
                var pricesInMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                var convertMonth = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
                for (var i = 0; i < data.length; i++) {
                    var month = data[i].updatedAt.toString().split(" ")[1];
                    pricesInMonth[convertMonth[month] - 1] += data[i].totalPrice;
                }
                res.json(pricesInMonth);
            })
            .catch(err => {
                res.status(500).json({ error: "error when statistical" });
            });

    }
    async StatisticalLast7Days(req, res) {
        try {
            let listOrder = await Orders.find({ isCompleted: true });
            let dataSend = [0, 0, 0, 0, 0, 0, 0];
            listOrder.forEach(element => {
                var difference = Math.abs(new Date() - element.updatedAt);
                var days = difference / (1000 * 3600 * 24)
                if (days < 7) {
                    dataSend[Math.ceil(days) - 1] += element.totalPrice;
                }
            });
            res.status(200).json(dataSend);
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "error when statistical" });
        }
    }
    GetAllOrder(req, res) {
        Orders.find({})
            .then(data => {
                res.json(mulMgToObject(data));
            })
            .catch(err => {
                res.status(500).json({ error: "error when get all order" });
            });
    }
    ConfirmOrder(req, res) {
        Orders.findByIdAndUpdate(req.params.id, {
            isConfirmed: true,
        }, { new: true })
            .then(order => {
                res.status(200).json(mongooseToObject(order));
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
    CancelOrder(req, res) {
        Orders.findByIdAndUpdate(req.params.id, {
            isCanceled: true,
            isConfirmed: false,
        }, { new: true })
            .then(order => {
                res.status(200).json(mongooseToObject(order));
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
    UpdateOrder(req, res) {
        let data = req.body;
        Orders.findByIdAndUpdate(req.params.id, data, { new: true })
        .then(order => {
            res.status(200).json(mongooseToObject(order));
        })
        .catch(err => {
            res.status(500).json(err);
        });
    }
    SetEmployee(req, res){
        // console.log(req.body);
        Orders.findByIdAndUpdate(req.params.id, {
            employeeInfo: req.body,
        }, { new: true })
        .then(order => {
            res.status(200).json(mongooseToObject(order));
        })
        .catch(err => {
            res.status(500).json(err);
        });
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //discount
    CreateDiscount(req, res) {
        try {
            const formData = req.body;
            let dataSave = {};
            dataSave.code = formData.discountCode;
            dataSave.percentSale = formData.percentSale;
            dataSave.endDate = formData.endDate;
            dataSave.name = formData.name;
            dataSave.description = formData.description;
            const discount = new Discount(dataSave);
            discount.save((err, discount) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Create discount error' });
                }
                console.log('tao giam gia moi thanh cong');
                res.status(201).json(mongooseToObject(discount));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Create discount error' });
        }

    }
    GetAllDiscount(req, res) {
        Discount.find({})
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(500).json({ error: "error when get all discount" });
        });
    }
    UpdateDiscount(req, res) {
        try {
            const id = req.params.id;
            const formData = req.body;
            formData.code = formData.discountCode;
            Discount.findByIdAndUpdate(id, formData, { new: true }, (err, discount) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Update discount error' });
                }
                console.log('cap nhat giam gia thanh cong');
                res.status(200).json(mongooseToObject(discount));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Update discount error' });
        }
    }
    DeleteDiscount(req, res) {
        try {
            const id = req.params.id;
            Discount.findByIdAndDelete(id, (err, discount) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Delete discount error' });
                }
                console.log('xoa giam gia thanh cong');
                res.status(200).json(mongooseToObject(discount));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Delete discount error' });
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //notification
    CreateNotification(req, res) {
        try {
            const formData = req.body;
            let dataSave = {};
            dataSave.expoPushToken = formData.expoPushToken;
            dataSave.title = formData.title;
            dataSave.content = formData.content;
            dataSave.type = formData.type;
            dataSave.from = formData.from;
            dataSave.detail = formData.detail;
            const notification = new Notification(dataSave);
            notification.save((err, notification) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Create notification error' });
                }
                console.log('tao thong bao moi thanh cong');
                res.status(201).json(mongooseToObject(notification));
            });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Create notification error' });
        }

    }
    GetAllNotification(req, res) {
        Notification.find({})
        .then(data => {
            res.status(200).json(mulMgToObject(data));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "error when get all notification" });
        });
    }
    GetNotificationByOrderId(req, res) {
        Notification.findOne({ 'detail.idOrder': req.params.idOrder })
        .then(data => {
            res.status(200).json(mongooseToObject(data));
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "error when get notification by idOrder" });
        });
    }
}


module.exports = new AdminControllers();