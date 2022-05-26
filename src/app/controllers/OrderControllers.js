const Notification = require('../models/notify');
const Discount = require('../models/discount');
const Account = require('../models/account');
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
        // console.log(req.body.listServiceChoose);
        let contactInfo = {
            email: req.body.email, name: req.body.name,
            phoneNumber: req.body.phoneNumber, address: req.body.address,
            description: req.body.description
        };
        if (req.body.defaultEmail) contactInfo.defaultEmail = req.body.defaultEmail;
        let dateAppointment = new Date(req.body.time);
        let time = new Date(req.body.time);
        let timeAppointment = `${time.getHours()}:${time.getMinutes()}`;
        let totalPrice = req.body.totalPrice;
        let percentSale = 0;
        if (req.body.percentSale) {
            percentSale = req.body.percentSale;
        }
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
            combo: req.body.combo,
            priceCombo: req.body.priceCombo,
        });
        order.save()
            .then(orderRes => {
                res.status(200).json(mongooseToObject(orderRes));
                cron.schedule(`0 ${dateAppointment.getMinutes()} ${dateAppointment.getHours()} ${dateAppointment.getDate()-1} ${dateAppointment.getMonth() + 1} *`, () => {
                    const SECRET_KEY_EMAIL = process.env.SECRET_SEND_EMAIL;
                    //mailgun
                    const DOMAIN = process.env.DOMAIN_MAILGUN;
                    let api_key = process.env.API_KEY_MAILGUN;
                    const mg = mailgun.client({ username: 'api', key: api_key });
                    const data = {
                        from: 'OtoViet <admin@otoviet.tech>',
                        to: [req.body.email],
                        subject: "Thông báo lịch hẹn",
                        html: `<p>Chào ${req.body.name},</p>
                        <p>Bạn đã đặt lịch hẹn thành công. Vui lòng kiểm tra lịch hẹn của bạn tại địa chỉ: <a href="http://localhost:3000/appointmentSchedule/${orderRes._id}">Này</a></p>
                        <p>Nếu bạn không phải là người đặt lịch hẹn, vui lòng bỏ qua email này.</p>
                        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
                        <p>Trân trọng,</p>
                        <p>OtoViet</p>`
                    };
                    mg.messages.create(DOMAIN, data)
                        .then(msg => {
                            console.log(msg);
                            Orders.findByIdAndUpdate(orderRes._id,{isSendEmail: true})
                            .then((dt)=>{
                                console.log=(dt);
                            })
                            .catch(e=>{
                                console.log(e);
                            })
                        }) // logs response data
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
        Orders.find({
            $or: [{ "contactInfo.defaultEmail": req.user.email },
            { "contactInfo.email": req.user.email },
            ], isCompleted: false, isCanceled: false
        })
            .then(orders => {
                res.status(200).json(mulMgToObject(orders));
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
    FindOrderByEmail(req, res) {
        Orders.find({
            $or:
                [
                    { "contactInfo.email": req.params.email },
                    { "contactInfo.defaultEmail": req.params.email },
                ], isCompleted: false, isCanceled: false
        })
            .then(orders => {
                res.status(200).json(mulMgToObject(orders));
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
    async GetOrderById(req, res) {
        try {
            let notificationType = await Notification.find({ 'detail.idOrder': req.params.id });
            let isCanceled = false;
            notificationType.forEach(element => {
                if (element.type === 'orderCancel') {
                    isCanceled = true;
                }
            });
            Orders.findById(req.params.id)
                .then(order => {
                    if (!order.isConfirmed && order.isCanceled) {
                        isCanceled = false;
                    }
                    let dataSend = mongooseToObject(order);
                    dataSend.requireCancel = isCanceled;
                    res.status(200).json(dataSend);
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        }
        catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    }
    async CancelOrder(req, res) {
        let orderFind = await Orders.findById(req.params.id);
        if (orderFind.isConfirmed) {
            res.status(403).json({ error: 'Không thể hủy đơn hàng đã được xác nhận' });
        }
        else {
            Orders.findByIdAndUpdate(req.params.id, { isCanceled: true }, { new: true })
                .then(order => {
                    res.status(200).json(mongooseToObject(order));
                })
                .catch(err => {
                    res.status(500).json(err);
                });
        }
    }
    UpdatePayStatuslOrder(req, res) {
        Orders.findByIdAndUpdate(req.params.id, { isPaid: true }, { new: true })
        .then(order => {
            res.status(200).json(mongooseToObject(order));
        })
        .catch(err => {
            res.status(500).json(err);
        });
    }
    GetAllOrderForEmployee(req, res) {
        console.log('hien thi thong tin ', req.user.email);
        Account.findOne({ email: req.user.email }).then(account => {
            if(account.roles=='employee'){
                Orders.find({"employeeInfo.email": req.user.email}).then(order => {
                    res.status(200).json(mulMgToObject(order));
                })
                .catch(err => {
                    res.status(500).json(err);
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
    }
    GetAllScheduleHistory(req, res) {
        // console.log('thong tin order cua',req.user.email);
        Orders.find({
            $or: [{ 
                $or: [
                    { "contactInfo.defaultEmail": req.user.email },
                    { "contactInfo.email": req.user.email },
                ],
                isCompleted: true }, { 
                    $or: [
                        { "contactInfo.defaultEmail": req.user.email },
                        { "contactInfo.email": req.user.email },
                    ],
                    isCanceled: true }]
        }, (err, orders) => {
            console.log(orders);
            if (err) res.status(500).json({ error: 'Get all schedule history error' });
            res.status(200).json(mulMgToObject(orders));
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////
    // discount
    GetDiscountByCode(req, res) {
        const code = req.params.code;
        Discount.findOne({ code: code })
            .then(discount => {
                if (discount) {
                    res.status(200).json({ percentSale: discount.percentSale });
                } else {
                    res.status(404).json({ error: 'Not found discount' });
                }
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
        var dateFormat = require('dateformat');


        var tmnCode = process.env.vnp_TmnCode;
        var secretKey = process.env.vnp_HashSecret;
        var vnpUrl = process.env.vnp_Url;
        var returnUrl = req.body.vnp_ReturnUrl ? req.body.vnp_ReturnUrl : process.env.vnp_ReturnUrl;
        var date = new Date();
        var createDate = dateFormat(date, 'yyyymmddHHmmss');
        var orderId = dateFormat(date, 'HHmmss');
        var amount = req.body.amount;
        var bankCode = req.body.bankCode;
        var orderInfo = req.body.orderDescription;
        var orderType = req.body.orderType;
        var locale = req.body.language;
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
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        res.json({ vnpUrl: vnpUrl });
        // res.redirect(vnpUrl);
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
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        console.log(vnp_Params);
        if (secureHash === signed) {
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            res.status(200).json(vnp_Params);
        } else {
            res.status(200).json({ code: '97' })
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
        var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            var orderId = vnp_Params['vnp_TxnRef'];
            var rspCode = vnp_Params['vnp_ResponseCode'];
            console.log("Thong tin orderId:", orderId);
            console.log("Thong tin resCode: ", rspCode);
            //Kiem tra du lieu co hop le khong, 
            //cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            res.status(200).json({ RspCode: vnp_Params['vnp_ResponseCode'], Message: 'success' })
        }
        else {
            res.status(200).json({ RspCode: '97', Message: 'Fail checksum' })
        }
    }
}


module.exports = new OrderControllers();