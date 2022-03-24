const express = require('express');
const router = express.Router();
const verifyToken = require('../app/middleware/auth');
const checkAdmin = require('../app/middleware/checkAdmin');
const AdminControllers = require('../app/controllers/AdminControllers');

//employees
router.post('/createEmployeeAccount', verifyToken, checkAdmin, AdminControllers.CreateEmployeeAccount);
router.post('/login', AdminControllers.login);
router.post('/checkAdmin', verifyToken, checkAdmin, AdminControllers.CheckAdmin);
router.get('/getAllEmployee', AdminControllers.GetAllEmployee);
router.get('/getEmployee/:id', verifyToken, checkAdmin, AdminControllers.GetEmployee);
router.delete('/deleteEmployee/:id', verifyToken, checkAdmin, AdminControllers.DeleteEmployee);
router.patch('/updateInfoEmployee/:id', verifyToken, checkAdmin, AdminControllers.UpdateInfoEmployee);
//products
router.post('/addNewProduct', verifyToken, checkAdmin, AdminControllers.AddNewProduct);
router.get('/getAllProduct', verifyToken, checkAdmin, AdminControllers.GetAllProduct);
router.patch('/updateProduct/:id', verifyToken, checkAdmin, AdminControllers.UpdateProduct);
router.delete('/deleteProduct/:id', verifyToken, checkAdmin, AdminControllers.DeleteProduct);
//stores
router.post('/createStore', verifyToken, checkAdmin, AdminControllers.CreateStore);
router.get('/getAllStore', AdminControllers.GetAllStore);
router.patch('/updateStore/:id', verifyToken, checkAdmin, AdminControllers.UpdateStore);
router.delete('/deleteStore/:id', verifyToken, checkAdmin, AdminControllers.DeleteStore);
module.exports = router;