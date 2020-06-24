const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: {  type: String },
    content: { type: String,  required: true },
    upVote:{ type: Number, default: 0 },
    downVote:{ type: Number, default: 0 },
    blacklist: { type: Boolean, default: false }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }, {
    timestamps: true,
});

postSchema.virtual('rxn', {
    ref: 'Review',
    foreignField: 'post',
    localField: '_id'
  });


const Post = mongoose.model('Post', postSchema);

module.exports = Post;