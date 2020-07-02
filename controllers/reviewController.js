const Post = require('../models/postModel');
const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.addReview = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
     return next(new AppError('No post found with that ID', 404));
   }
   
   let newReview = await Review.create({review:req.body.review, post:req.params.id, user:req.user._id});
   
   res.status(201).json({
        status:'success',
        data: {
          review: newReview
        }
   });

});

exports.deleteReview = catchAsync(async (req, res, next) => {
   
   let findReview = await Review.findOneAndDelete({post:req.params.id, user:req.user._id});

   if(!findReview) {
    return next(new AppError('you have not reacted to this post yet!',404) );
  }
  
  res.status(204).json({
    status: 'success',
    message: 'review deleted'
  });

});

exports.updateReview = catchAsync(async (req, res, next) => {
   
  const findReview = await Review.findOneAndUpdate({post:req.params.id, user:req.user._id},{review:req.body.review});

  if(!findReview) {
   return next(new AppError('No such review found!',404) );
 }

 res.status(200).json({
   status: 'success',
   message: 'review updated',
   data:{findReview}
 });

});