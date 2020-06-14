const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout',authController.protect, authController.logout);

router.get('/isLoggedIn',authController.protect, authController.checkLoggedInStatus);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.get('/myPosts',authController.protect, userController.myPosts);

router
  .route('/')
  .get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .patch(authController.protect, authController.restrictTo('admin'), userController.updateUser);

module.exports = router;