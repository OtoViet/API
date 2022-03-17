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
    GetProductById(req, res){
        Products.findById(req.params.id, (err, product) => {
            if(err) res.status(404).json({ error: 'Not found product by id' });
            res.status(200).json(mongooseToObject(product));
        });
    }
    GetInfoCustomer(req, res){
        Account.findOne(req.body.email, (err, account) => {
            if(err) res.status(500).json({ error: 'Get info customer error' });
            res.status(200).json(mongooseToObject(account));
        });
    }
   
}


module.exports = new CustomerControllers();