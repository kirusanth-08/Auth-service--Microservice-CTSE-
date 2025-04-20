const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// handle user registration
exports.register = async (req, res) => {
    // check if there is any validation error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
    try {
      // save the user to the database
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword });

      await user.save();
      res.status(201).json({ message: "User registered" });

    } catch (err) {
      // check if the user already exists 
      if (err.code === 11000) {
        // MongoDB duplicate key error
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Server error: " + err.message });
    }
  };


  
// handle user login
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = generateToken(user);
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
