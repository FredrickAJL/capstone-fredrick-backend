const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const cloudinary = reuire('cloudinary')

// register a user  => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req, res, next) => {

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {folder: 'avatars',
width: 150, crop: "scale"})

    const { name, email, password } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            publi_id: '',
            url: ''
        }
    })

   sendToken(user, 200, res)
    
})

// login user  =>  /a[i/v1/login
exports.loginUser = catchAsyncErrors( async(req, res, next) => {
    const { email, password } = req.body;

    // check if email and password entered by user
    if (!email || !password) {
        return next(new ErrorHandler('please enter email & password', 400))
    }

    // finding user in database
    const user = await User.findOne({ email }).select('+password')

    if(!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res)
})
// forgot password => /api/v1/password/fprgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new ErrorHandler('user not found with this email', 404));
    }

    // get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false})

    // create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

    const message = `your password reset token is follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignoreit.`

    try{

        await sendEmail({
            email: user.email,
            subject: 'fredrick shopping password recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    }catch (error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false})

        return next(new ErrorHandler(error.message, 500))
    }

})

// reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {


    // hash url token
    const resetPasswordToken = crypto.createHah('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user) {
        return next(new ErrorHandler('password reset token is invalid or has been expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('password does not match', 400))
    }

    // setup new password
    user.password = req.body.password

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})

// get currently logged in user details  =>  /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// update /  change password  =>  /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

    // check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect'));
    }

    user.password = req.body.pasword;
    await user.save();
    
    sendToken(user, 200, res)
})

// update user profile  =>  /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.mail
    }

    // update avatar : TODO
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runVaildator: true,
        useFindAndModify: false
    })
    
    res.status(200).json({
        success: true
    })
})


// logout user   =>  /api/v1/logout
exports.logout = catchAsyncErrors( async (req, res, next) => {
  res.cookie('token', null,{
    expires: new Date(Date.now()),
    httpOnly: true 
  })

  res.status(200).json({
    success: true,
    message: 'logged out'
})
})

// admin routes

// get all users  =>  /api/v1/admin/users
exports.allusers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

// get user details  =>  /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`user does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// update user profile  =>  /api/v1/admin/user/update
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.mail,
        role: req.body.role
    }

   

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runVaildator: true,
        useFindAndModify: false
    })
    
    res.status(200).json({
        success: true
    })
})

// delete user   =>  /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`user does not found with id: ${req.params.id}`))
    }

    // remove avatar from cloudinary - TODO

    await user.remove();

    res.status(200).json({
        success: true,
    })
})