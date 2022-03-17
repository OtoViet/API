const express = require('express');
const router = express.Router();
const verifyToken = require('../app/middleware/auth');
const CustomerControllers = require('../app/controllers/CustomerControllers');

//products
router.get('/getAllProduct', CustomerControllers.GetAllProduct);
router.get('/getProductById/:id', CustomerControllers.GetProductById);

//customer
router.get('/getInfoCustomer', verifyToken, CustomerControllers.GetInfoCustomer);
module.exports = router;