const express = require('express');
const Post = require('../models/postModel.js');

const router = express.Router();

router.route('/').get((req, res) => {
   Post.find()
   .then(posts => res.json(posts))
   .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req,res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(400).json('Error: '+ err));
});

router.route('/:id').delete((req,res) => {
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.json('Post deleted'))
    .catch(err => res.status(400).json('Error: '+ err));
});

router.route('/update/:id').post((req,res) => {
    Post.findById(req.params.id)
    .then(post => {
        post.content = req.body.content;
        
        post.save()
        .then(() => res.json('Post updated'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: '+ err));
});

router.route('/add').post((req,res) => {
    const author = req.body.author;
    const content = req.body.content;

    const newPost = new Post({
        author: author,
        content: content,
        upVote: 0,
        downVote: 0
    });

    newPost.save()
    .then(() => res.json('post added'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;