const express = require('express');
const postController = require('../controllers/postController.js');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, postController.addPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePost);

router
   .route('/review/:id')
   .post(authController.protect, reviewController.addReview)
   .patch(authController.protect, reviewController.updateReview)
   .delete(authController.protect, reviewController.deleteReview);
  

module.exports = router;
