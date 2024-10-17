const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protecting all routes coming after this point
router.use(authController.protect);

router.delete('/deleteAccount', userController.deleteMe);
// router.get('/inactive', userController.getAllInactive);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);

// To restrict to admins after this point
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
