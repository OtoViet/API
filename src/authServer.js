const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const route = require('./routes');
const cors = require('cors');
const db = require('./config/db');

require('dotenv').config();
db.connect();
app.use(cors());
app.use(morgan('combined'));
app.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));
app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
app.use(express.json());


route(app);