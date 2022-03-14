const express = require('express');
const router = express.Router();
const verifyToken = require('../app/middleware/auth');
const CustomerControllers = require('../app/controllers/CustomerControllers');

//products
router.get('/getAllProduct', CustomerControllers.GetAllProduct);
module.exports = router;