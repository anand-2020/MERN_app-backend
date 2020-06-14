
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    } );
};

const createSendToken =(user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      //  domain:'http://localhost:3000/'
    };
    if(process.env.NODE_ENV === 'production ') {  cookieOptions.secure = true; console.log(cookieOptions.secure); }

    res.cookie('jwt', token, cookieOptions); 

    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data: { user }
    });
};

exports.signup = catchAsync( async (req,res,next) => {
    const newUser = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword:req.body.confirmPassword
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password} = req.body;

   if(!email || !password) {
      return next(new AppError('Please provide email and password', 400));
   }

   const user = await User.findOne({email}).select('+password');

   if(!user || !(await user.correctPassword(password, user.password)) ) {
       return next(new AppError('Incorrect email or password', 401));
   }

   createSendToken(user, 200, res);
});

exports.logout = (req,res) => {
    res.cookie('jwt', 'loggedout', {
         expires:new Date(Date.now + 40 * 1000),
         httpOnly: true
    });
    res.status(200).json({status: 'success', message:'Logged out!!'});
};

exports.checkLoggedInStatus = (req,res) => {
      res.status(200).json({
          status: 'success',
          data: { user:req.user   }
      });
};

exports.protect = catchAsync(async (req,res,next) => {
    let token;
    if(
        req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ) { token = req.headers.authorization.split(' ')[1]; }
    else if(req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if(!token) {
        return next(
            new AppError('Access Denied!! Please log in to get access', 401)
        );
    }
      let decoded;
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            decoded = user;
            req.user= user;
      });

      if(!decoded){
          return next(
              new AppError('Invalid token', 403)
          );
      }

    const freshUser = await User.findById(decoded.id);
    if(!freshUser) { 
        return next(new AppError('The token belonging to this user does no longer exist', 401)) }
    

    if(freshUser.changedPasswordAfter(decoded.iat) ) {
        return next(new AppError('Access denied!!. Login again', 401) );
    }

    req.user = freshUser;
    next();
});

exports.restrictTo = (...role) => {
    return (req,res,next) => {
       if(!role.includes(req.user.role)) {
           return next(new AppError('Access Denied!!',403));
       }
        
       next();
    };
};

exports.updatePassword =catchAsync(async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');
    
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Password Wrong', 401));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    
    createSendToken(user, 200, res);

});