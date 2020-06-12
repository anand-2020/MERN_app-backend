const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, userController.updateMe);

router
  .route('/')
  .get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .patch(authController.protect, authController.restrictTo('admin'), userController.updateUser);

module.exports = router;