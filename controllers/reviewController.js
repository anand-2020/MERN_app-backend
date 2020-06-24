const Post = require('../models/postModel');
const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { find } = require('../models/postModel');

exports.addReview = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
     return next(new AppError('No post found with that ID', 404));
   }
   if(post.blacklist){
     return next (new AppError('This post has been BLACKLISTED!!',404));
   }
   
   let findReview = await Review.findOne({post:req.params.id, user:req.user._id});
   if(!findReview) {
        findReview = new Review ({
        review: req.body.review,
        post:req.params.id,
        user:req.user._id
   }); 
       const addedReview = await Review.create(findReview);
     }
   else {
        if(findReview.review !== req.body.review)
        {
            findReview.review = req.body.review;
            await findReview.save();
        }
        else{
            return next(new AppError('You can not like/dislike a post multiple times',403) );
        }
   }

   res.status(201).json({
        status:'success',
        data: {
          review: findReview
        }
   });

});

exports.deleteReview = catchAsync(async (req, res, next) => {
   
   let findReview = await Review.findOne({post:req.params.id, user:req.user._id});

   if(!findReview) {
    return next(new AppError('you have not reacted to this post yet!',404) );
  }
  
   await findReview.remove();

  res.status(204).json({
    status: 'success',
    message: 'review deleted'
  });

});