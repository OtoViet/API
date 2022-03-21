const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const verifyToken = require('./app/middleware/auth');
const cookieParser = require('cookie-parser');
require('dotenv').config();
var cors = require('cors');
app.use(cors());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));

app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
const posts = [
    { title: 'Post 1', content: 'Content 1' },
    { title: 'Post 2', content: 'Content 2' },
    { title: 'Post 3', content: 'Content 3' }
];

app.get('/api',verifyToken,(req,res)=>{
    res.json(posts);
});


app.listen(4000, () => {
    console.log('server is running on port 4000');
});