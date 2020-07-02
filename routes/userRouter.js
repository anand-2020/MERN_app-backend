const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout',authController.protect, authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:email', authController.resetPassword);
router.get('/isLoggedIn',authController.protect, authController.checkLoggedInStatus);

router
   .route('/verifyEmail')
   .get(authController.protect, authController.getEmailToken)
   .post(authController.protect, authController.verifyEmailToken);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.get('/posts/:username',authController.protect,userController.myPosts);

router
  .route('/')
  .get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .patch(authController.protect, authController.restrictTo('admin'), userController.updateUser);

module.exports = router;