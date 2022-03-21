const express = require('express');
const router = express.Router();
const OrderControllers = require('../app/controllers/OrderControllers');
router.post('/create_payment_url', OrderControllers.CreatePaymentUrl);
router.get('/vnpay_return', OrderControllers.VnpayReturn);
router.get('/vnpay_ipn', OrderControllers.VnpayIpn);
router.post('/createOrder', OrderControllers.CreateOrder);
// order
router.get('/getAllOrder', OrderControllers.GetAllOrder);
module.exports = router;