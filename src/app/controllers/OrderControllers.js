const Account = require('../models/account');
const Products = require('../models/products');
const Orders = require('../models/orders');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const { mongooseToObject, mulMgToObject } = require('../../utils/mongoose');
require('dotenv').config();
const cron = require('node-cron');

function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

class OrderControllers {
    CreateOrder(req, res) {
        // console.log(req.body);
        let contactInfo = {
            email: req.body.email, name: req.body.name,
            phoneNumber: req.body.phoneNumber, address: req.body.address,
            description: req.body.description
        };
        let dateAppointment = new Date(req.body.time);
        let time = new Date(req.body.time);
        let timeAppointment = `${time.getHours()}:${time.getMinutes()}`;
        let totalPrice = 0;
        let percentSale = 0;
        if (req.body.percentSale) {
            percentSale = req.body.percentSale;
        }
        req.body.listServiceChoose.forEach(element => {
            totalPrice += element.price;
        });
        totalPrice -= (totalPrice * percentSale / 100);
        totalPrice += 50000;
        const order = new Orders({
            contactInfo,
            dateAppointment,
            listService: req.body.listServiceChoose,
            timeAppointment,
            storeAddress: req.body.carePoint,
            address: req.body.address,
            description: req.body.description,
            carSize: req.body.carSize,
            totalPrice,
            percentSale,
        });
        order.save()
            .then(order => {
                res.status(200).json(mongooseToObject(order));
                cron.schedule(`0 0 0 ${dateAppointment.getDate()} ${dateAppointment.getMonth()+1} *`, () => {
                    const SECRET_KEY_EMAIL = process.env.SECRET_SEND_EMAIL;
                    //mailgun
                    const DOMAIN = process.env.DOMAIN_MAILGUN;
                    let api_key = process.env.API_KEY_MAILGUN;
                    const mg = mailgun.client({ username: 'api', key: api_key });
                    const data = {
                        from: 'OtoViet <admin@otoviet.tech>',
                        to: ["nguyennhattan1562000@gmail.com"],
                        subject: "Thông báo lịch hẹn",
                        html: `<p>Chào ${req.body.name},</p>
                        <p>Bạn đã đặt lịch hẹn thành công. Vui lòng kiểm tra lịch hẹn của bạn tại địa chỉ: <a href="http://localhost:3000/appointmentSchedule/${order._id}">Này</a></p>
                        <p>Nếu bạn không phải là người đặt lịch hẹn, vui lòng bỏ qua email này.</p>
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                        <p>Trân trọng,</p>
                        <p>OtoViet</p>`
                    };
                    mg.messages.create(DOMAIN, data)
                        .then(msg => console.log(msg)) // logs response data
                        .catch(err => console.log(err)); // logs any error
                }, {
                    scheduled: true,
                    timezone: "Asia/Ho_Chi_Minh"
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
    GetAllOrder(req, res) {
        Orders.find({ "contactInfo.email": "tan@gmail.com" })
            .then(orders => {
                res.status(200).json(mulMgToObject(orders));
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
    GetOrderById(req, res) {
        Orders.findById(req.params.id)
            .then(order => {
                res.status(200).json(mongooseToObject(order));
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
    CreatePaymentUrl(req, res) {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        console.log('cc');
        console.log(req.body);
        var dateFormat = require('dateformat');


        var tmnCode = process.env.vnp_TmnCode;
        var secretKey = process.env.vnp_HashSecret;
        var vnpUrl = process.env.vnp_Url;
        var returnUrl = process.env.vnp_ReturnUrl;
        var date = new Date();
        var createDate = dateFormat(date, 'yyyymmddHHmmss');
        var orderId = dateFormat(date, 'HHmmss');
        var amount = req.body.amount;
        var bankCode = req.body.bankCode;
        var orderInfo = req.body.orderDescription;
        var orderType = req.body.orderType;
        var locale = req.body.language;
        console.log(bankCode);
        console.log(orderInfo);
        if (locale === null || locale === '') {
            locale = 'vn';
        }
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        res.redirect(vnpUrl);
    }
    VnpayReturn(req, res) {
        var vnp_Params = req.query;

        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        var tmnCode = process.env.vnp_TmnCode;
        var secretKey = process.env.vnp_HashSecret;

        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

            res.render('success', { code: vnp_Params['vnp_ResponseCode'] })
        } else {
            res.render('success', { code: '97' })
        }
    }
    VnpayIpn(req, res) {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        var secretKey = process.env.vnp_HashSecret;
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");


        if (secureHash === signed) {
            var orderId = vnp_Params['vnp_TxnRef'];
            var rspCode = vnp_Params['vnp_ResponseCode'];
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            res.status(200).json({ RspCode: '00', Message: 'success' })
        }
        else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
        }
    }
}


module.exports = new OrderControllers();