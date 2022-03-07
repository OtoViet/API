const express = require('express');
const router = express.Router();
const verifyToken = require('../app/middleware/auth');
const checkAdmin = require('../app/middleware/checkAdmin');
const AdminControllers = require('../app/controllers/AdminControllers');

router.post('/createEmployeeAccount', verifyToken, checkAdmin, AdminControllers.CreateEmployeeAccount);
router.post('/login', AdminControllers.login);
router.post('/checkAdmin', verifyToken, checkAdmin, AdminControllers.CheckAdmin);
router.get('/getAllEmployee', verifyToken, checkAdmin, AdminControllers.GetAllEmployee);
router.get('/getEmployee/:id', verifyToken, checkAdmin, AdminControllers.GetEmployee);
router.delete('/deleteEmployee/:id', verifyToken, checkAdmin, AdminControllers.DeleteEmployee);
router.patch('/updateInfoEmployee/:id', verifyToken, checkAdmin, AdminControllers.UpdateInfoEmployee);
module.exports = router;