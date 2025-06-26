const User = require('../models/User');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const { sendResetEmail, sendPasswordResetEmail } = require('../config/email');

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user - default role is 'user'
    const user = await User.create({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      role: 'user' // Default role
    });

    // Remove password from response
    user.password = undefined;

    // Log in the user by setting session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after registration' });
      }
      return res.status(201).json({ user });
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Add admin registration - requires existing admin authorization
exports.registerAdmin = async (req, res) => {
  try {
    // Check if requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new admin user
    const user = await User.create({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      role: 'admin'
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({ user });

  } catch (error) {
    logger.error('Admin registration error:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Remove password from response
    user.password = undefined;

    // Log in the user by setting session
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      return res.json({ user });
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions.' 
      });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ 
      success: true,
      message: 'Password reset instructions sent to your email.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.checkSession = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.user || req.user.isActive === false) {
      return res.status(401).json({ authenticated: false, message: 'Account is disabled' });
    }

    res.json({ authenticated: true, user: req.user });
  } catch (error) {
    logger.error('Session check error:', error);
    res.status(500).json({ message: 'Error checking session' });
  }
};
