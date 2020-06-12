const Post = require('../models/postModel.js');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllPosts = catchAsync(async (req,res,next) =>{
    const posts = await Post.find();

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

  res.status(200).json({
    status: 'success',
    data: {
      post
    }
  });
});

exports.addPost = catchAsync(async (req,res,next) => {
    const author = req.body.author;
    const content = req.body.content;

    const newPost = new Post({
        author: author,
        content: content,
        upVote: 0,
        downVote: 0
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
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    
      if (!post) {
        return next(new AppError('No post found with that ID', 404));
      }
    
      res.status(200).json({
        status: 'success',
        data: {
          post
        }
      });
});

exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return next(new AppError('No post found with that ID', 404));
    }
  
    res.status(204).json({
      status: 'success',
      message: 'post deleted'
    });
});
