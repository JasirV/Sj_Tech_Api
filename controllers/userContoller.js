const User = require('../models/userModel'); // Assuming you have a User model
const bcrypt = require('bcrypt'); // For password hashing

// Login Controller
const loginUser = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required!' });
    }
    
    // Find user by userId
    const user = await User.findOne({ userId: userId.trim() }); // Use trimmed input to avoid unnecessary spaces
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password!' });
    }

    // Successful login (testing purpose message)
    res.status(200).json({ message: 'Login successful!', userId: user.userId });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser };
