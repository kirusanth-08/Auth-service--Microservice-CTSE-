const { body } = require('express-validator');


// validation for /register route
const validateRegister = [
  body('email', 'Email is required and must be valid').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
];


// validation for /login route
const validateLogin = [
  body('email', 'Please enter a valid email').isEmail(),
  body('password', 'Password is required').notEmpty()
];


module.exports = {
  validateRegister,
  validateLogin
};