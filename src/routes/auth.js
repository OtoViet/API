const express = require('express');
const router = express.Router();
const AuthControllers = require('../app/controllers/AuthControllers');
const verifyToken = require('../app/middleware/auth');
const verifyResetPassword = require('../app/middleware/verifyResetPassword');
router.get('/test',(req, res) => {res.json({"test": "ahihi"})});
router.post('/signUp',AuthControllers.SignUp);
router.post('/checkExistAccount',AuthControllers.CheckExistAccount);
router.post('/login',AuthControllers.Login);
router.post('/loginGoogle',AuthControllers.LoginGoogle);
router.post('/token',AuthControllers.Token);
router.delete('/logout',verifyToken,AuthControllers.Logout);
router.post('/checkTokenResetPassword',AuthControllers.CheckTokenResetPassword);
router.patch('/forgotPassword',AuthControllers.ForgotPassword);
router.post('/resetPassword',verifyResetPassword,AuthControllers.ResetPassword)
module.exports = router;