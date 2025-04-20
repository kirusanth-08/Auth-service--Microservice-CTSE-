const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../middleware/validators/authValidators');

// vinu- added input validations
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);


// protected routes
// inject middleware before controller is called
router.get('/profile', authMiddleware, getProfile);


module.exports = router;