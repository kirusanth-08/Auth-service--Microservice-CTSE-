const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);


//test protected routes
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: `Hello ${req.user.id}, you accessed a protected route!` });
  });

// inject middleware before controller is called
router.get('/profile', authMiddleware, getProfile);


module.exports = router;