const catchAsyncErrors = require ('../middlewares/catchAsyncErrors')

const stripe = require('stripe') (process.env.STRIPE_SECRET_KEY);

//process stripe payments  =>  /api/v1/payment/process
exports.processPayment = catchAsyncErrors( async (req, res, next) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount:  req.body.amount,
        currency: 'usd',metadata: { integration_check: 'accept_ a_payment' }
    });

    res.status(200).json({
        success: true,
        client_Secret: paymentIntent.client_secret
    })
})

//send stripe api key payments  =>  /api/v1/payment/process
exports.sendStripeApi = catchAsyncErrors( async (req, res, next) => {

   
    res.status(200).json({
        
    })
    
})