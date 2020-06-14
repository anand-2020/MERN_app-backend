const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: {  type: String },
    content: { type: String,  required: true },
    upVote:{ type: Number, default: 0 },
    downVote:{ type: Number, default: 0 },
    blacklist: { type: Boolean, default: false }
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;