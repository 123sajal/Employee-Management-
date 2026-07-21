const express = require('express');
const { body }  = require('express-validator');
const { login, register, getMe, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').optional().isIn(['admin', 'manager']).withMessage('Role must be admin or manager.'),
  ],
  validate,
  register
);

router.get('/me', authenticate, getMe);

router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  ],
  validate,
  changePassword
);

module.exports = router;
