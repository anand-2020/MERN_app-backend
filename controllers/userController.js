const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Post = require('../models/postModel');

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
  if(req.body.password || req.body.confirmPassword) {
      return next(
          new AppError('This route is not for password updates', 400)
      );
  }

const filteredBody = filterObj(req.body, 'username', 'email');
const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
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
    
      if (!user) {
        return next(new AppError('No user found with that ID', 404));
      }
      /*if(user.blacklist){
        const posts = await Post.find({author:user.username });
        posts.forEach( post => { post.blacklist= true; });

        await posts.save();
      }*/
      
    
      res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
});

exports.myPosts = catchAsync(async (req, res, next) => {
     const posts = await Post.find({author:req.user.username });

     res.status(200).json({
      status: 'success',
      data: {
        posts
      }
    });
});