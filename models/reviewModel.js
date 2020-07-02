const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      enum: ['upVote','downVote'],
      required: [true, 'Review can not be empty!']
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'Review must belong to a post.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
);

reviewSchema.index({post: 1, user: 1}, {unique: true});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
