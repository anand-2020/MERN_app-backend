const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const bcrypt = require('bcryptjs');


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
        confirmPassword:req.body.confirmPassword,
        lastLogin: Date.now()
    });
    
    await new Email(newUser).sendWelcome(); 

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
   user.lastLogin = Date.now();
   await user.save({validateBeforeSave:false});
  
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

exports.forgotPassword = catchAsync(async (req,res,next) => {
    const user = await User.findOne({email : req.body.email});
    if(!user) {
        return next(new AppError('There is no user with this email',404));
    }

    const resetToken = await user.passwordResetToken();

    await user.save({validateBeforeSave: false});

    try {
       
       await new Email(user,resetToken).sendPassswordReset();

        res.status(200).json({
            status:'success',
            message:'Token sent to email!'
        });
    } catch(err) {
        user.passResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save({ validateBeforeSave: false});

        return next(new AppError('There was an error sending the mail. Try again later!!',500));
    }
    
});

exports.resetPassword = async (req,res,next) => {
    const user = await User.findOne({email: req.params.email,  passwordResetExpires: {$gt:Date.now()}});
   
    if(!user){

        return next(new AppError('OTP has expired!',400));
    }

    const hashedToken = await bcrypt.compare(req.body.token, user.passResetToken);
    
    if(!hashedToken ){
        user.passResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('Wrong OTP !!',400));
    }
      
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        status:'success',
        token,
        data:{ user }
    }) 

}

exports.verifyEmailToken = catchAsync(async (req, res, next) => {
    const d1 = new Date(req.user.emailTokenExpires);
    const dt = Date.now();
    const d2 = new Date(dt);
     if(d2>d1){
         return next(new AppError('OTP Expired!!',400));
     }
     const token = await bcrypt.compare(req.body.token, req.user.emailVerificationToken);

     if(!token){
        req.user.emailVerificationToken = undefined;
        req.user.emailTokenExpires = undefined;
        await req.user.save({validateBeforeSave:false});
        return next(new AppError('Wrong OTP !!',400));
     }
     
     req.user.emailIsVerified = true;
     req.user.emailVerificationToken = undefined;
     req.user.emailTokenExpires=undefined;
     await req.user.save({validateBeforeSave: false});

     await new Email(req.user).emailVerified();
     res.status(200).json({
         status:'success',
         message:'Your email has been verified!'
     });
});

exports.getEmailToken = catchAsync(async (req, res, next) => {
    const token = Math.floor(Math.random()*Math.floor(9999));
    const hashedToken = await bcrypt.hash(JSON.stringify(token), 10);
    const dt = Date.now() + 10 * 60 * 1000;
    
    req.user.emailVerificationToken = hashedToken;
    req.user.emailTokenExpires = dt;
    const user = await req.user.save({validateBeforeSave:false});

   
    try {
       
        await new Email(user,hashedToken).emailVerificationToken(); 
 
        res.status(200).json({
            status:'success',
            message:'token sent to mail',
            data:{user}
        });
     } catch(err) {
        req.user.emailVerificationToken = undefined;
        req.user.emailTokenExpires = undefined;
         
         await req.user.save({ validateBeforeSave: false});
 
         return next(new AppError('There was an error sending the mail. Try again later!!',500));
     }
      
  
});