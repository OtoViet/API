const express = require('express');
const router = express.Router();
const AuthControllers = require('../app/controllers/AuthControllers');
const verifyToken = require('../app/middleware/auth');

router.get('/test',(req, res) => {res.json({"test": "ahihi"})});
router.post('/signUp',AuthControllers.SignUp);
router.post('/checkExistAccount',AuthControllers.CheckExistAccount);
router.post('/login',AuthControllers.Login);
router.post('/token',AuthControllers.Token);
router.delete('/logout',verifyToken,AuthControllers.Logout);

module.exports = router;