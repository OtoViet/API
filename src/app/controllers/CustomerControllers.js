const jwt = require('jsonwebtoken');
const Account = require('../models/account');
const Products = require('../models/products');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const { mongooseToObject, mulMgToObject } = require('../../utils/mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

//employees
class CustomerControllers {
    async GetAllProduct(req, res){
        try{
            const products = await Products.find({});
            if(products) res.status(200).json(mulMgToObject(products));
        }
        catch(err){
            console.log(err);
            res.status(500).json({ error: 'Get all product error' });
        }
    }
   
}


module.exports = new CustomerControllers();