const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Post = require('../models/postModel');
const Email = require('./../utils/email');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
       if(allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async (req,res,next) => {
    const users = await User.find();

    res.status(200).json({
        status:'success',
        data:{ users }
    });
});

exports.updateMe = catchAsync(async (req,res,next) => {
 
const updatedUser = await User.findByIdAndUpdate(req.user.id, {email:req.body.email, emailIsVerified:false}, {
    new: true,
    runValidators: true
});

  res.status(200).json({
    status:'success',
    data:{
        user: updatedUser
    }
   });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'role','blacklist');
    const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
       runValidators: true
      });
    
      if (!user){
        return next(new AppError('No user found with that ID', 404));
      }
      if(req.body.blacklist===true) { 
        await Post.updateMany({author:req.body.username},{blacklist:true});
        await new Email(user).userBlacklisted();
      }

      if(req.body.blacklist===false) {
        await new Email(user).userWhitelisted();
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
});

exports.myPosts = catchAsync(async (req, res, next) => {
     const posts = await Post.find({author:req.params.username }).sort('-createdAt').populate('rxn');

     res.status(200).json({
      status: 'success',
      data: {
        posts
      }
    });
});