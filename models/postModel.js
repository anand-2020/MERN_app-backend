const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: {  type: String,  required: true },
    content: { type: String,  required: true },
    upVote:{ type: Number },
    downVote:{ type: Number },
    blacklist: { type: Boolean}
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;