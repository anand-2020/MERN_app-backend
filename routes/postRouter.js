const express = require('express');
const postController = require('../controllers/postController.js');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, postController.addPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, authController.restrictTo('admin'), postController.deletePost);
  

module.exports = router;
