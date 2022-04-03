const express = require('express');
const router = express.Router();
const verifyToken = require('../app/middleware/auth');
const OrderControllers = require('../app/controllers/OrderControllers');
router.post('/create_payment_url', OrderControllers.CreatePaymentUrl);
router.get('/vnpay_return', OrderControllers.VnpayReturn);
router.get('/vnpay_ipn', OrderControllers.VnpayIpn);
// order
router.post('/createOrder', OrderControllers.CreateOrder);
router.get('/getAllOrder',verifyToken, OrderControllers.GetAllOrder);
router.get('/getAllScheduleHistory', verifyToken, OrderControllers.GetAllScheduleHistory);
router.get('/getOrderById/:id',verifyToken, OrderControllers.GetOrderById);
router.patch('/cancelOrder/:id',verifyToken, OrderControllers.CancelOrder);
//discount
router.get('/getDiscountByCode/:code', OrderControllers.GetDiscountByCode);
module.exports = router;