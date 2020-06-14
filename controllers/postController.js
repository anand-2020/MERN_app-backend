const Post = require('../models/postModel.js');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllPosts = catchAsync(async (req,res,next) =>{
    const posts = await Post.find({ blacklist: false });

    res.status(200).json({
        status: 'success',
        data: {
          posts
        }
      });
});

exports.getPost = catchAsync(async (req, res,next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        
    return next(new AppError('No post found with that ID', 404));
  }

  if(post.blacklist){
    return next (new AppError('This post has been BLACKLISTED!!',404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.addPost = catchAsync(async (req,res,next) => {
    if(req.user.blacklist) {
      return ( new AppError('You have been BLACKLISTED!!',401));
    }

    const author = req.user.username;
    const content = req.body.content;

    const newPost = new Post({
        author: author,
        content: content
    }); 
    console.log(req.body);
    const addedPost = await Post.create(newPost);

    res.status(201).json({
      status: 'success',
      data: {
        post: addedPost
      }
    });
   
});

exports.updatePost = catchAsync(async (req,res,next) => {
    const post = await Post.findById(req.params.id );
    
      if (!post) {
        return next(new AppError('No post found with that ID', 404));
      }
     
      if((req.user.username !== post.author) && (req.user.role !== 'admin')) {
        return next(new AppError(`You don't have permission to update this post`,403));
      }

      post.content = req.body.content;
      if(req.body.blacklist && req.user.role === 'admin') post.blacklist = req.body.blacklist;

      await post.save();

      res.status(200).json({
        status: 'success',
        data: {
          post
        }
      });
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new AppError('No post found with that ID', 404));
    }
    
    if(req.user.username !== post.author && req.user.role !== 'admin') {
      return next(new AppError(`You don't have permission to delete this post`,403));
    }
    
    await post.remove();
  
    res.status(204).json({
      status: 'success',
      message: 'post deleted'
    });
});
