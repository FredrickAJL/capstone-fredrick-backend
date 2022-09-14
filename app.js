const express = require('express');
const app = express();

const cookieParser = require('cookie-parser')
const bodyparser = require('body-parser')
const fileUpload = require('express-fileUpload')
//const dotenv = require('dotenv');
const path = require('path')

const errorMiddleware = require('./middlewares/errors')

// setting up config file 
if (process.env.NODE_ENV === 'PRODUCTION') require('dotenv').dotenv.config({ path: 'backend/config/config.env' })

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true}));
app.use(cookieParser())
app.use(fileUpload());




// Import all routes 
const product = require('./routes/product');
const auth = require('./routes/auth');
const payment = require('./routes/payment');
const order = require('./routes/order');
const bodyParser = require('body-parser');
const { config } = require('dotenv');

app.use('/api/v1', product)
app.use('/api/v1', auth)
app.use('/api/v1', payment)
app.use('/api/v1', order)

if(process.env.NODE_ENV === 'PRODUCT') {
    app.use(express.static(path.json(__dirname, '../frontend/build')))

    app.get('#', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    })
}

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app