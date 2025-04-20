const User = require("../models/User");



exports.getProfile = async (req, res) => {
  try {
    
    // req.user is added by authMiddleware
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile fetched successfully',
      user
    });

  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
