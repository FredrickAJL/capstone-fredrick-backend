const app = require('./app')
const connectDatabase = require('./config/database')

const dotenv = require('dotenv');
const cloudinary = require('cloudinary')

//  handle uncaught exceptions
process.on('uncaughtException', err =>{
    console.log(`ERROR: ${err.stack}`);
    console.log('shutting down due to uncaught exception');
    process.exit(1)
})

// setting up config file 
if (process.env.NODE_ENV === 'PRODUCTION') require('dotenv').dotenv.config({ path: 'backend/config/config.env' })


// Connecting to database
connectDatabase();

//setting up cloudinary configuration
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME
   })

const server = app.listen(process.env.PORT, () => {
    console.log(`server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

// handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('shutting down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1)
    })
})