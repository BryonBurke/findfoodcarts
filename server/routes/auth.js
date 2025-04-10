import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../config/mail.js';
import { resetPasswordTemplate } from '../templates/resetPassword.js';
import User from '../models/User.js';

const router = express.Router();
console.log('[auth.js] Router file loaded'); // Log router load

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Error fetching user data' });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('[POST /login] Request received'); // Log entry into route handler
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    console.log(`[POST /login] Attempting to send response. Token length: ${token?.length}, User: ${JSON.stringify(user)}`);
    res.json({ token, user: { email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate reset token
    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send email
    await sendEmail(
      email,
      'Password Reset Request',
      `Click this link to reset your password: ${resetLink}`,
      resetPasswordTemplate(resetLink)
    );

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Error sending password reset email' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('Reset password request:', { token, newPassword });

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const { email } = decoded;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('User not found, creating new user:', email);
      // Create new user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user = new User({
        email,
        password: hashedPassword
      });
      await user.save();
      console.log('New user created:', email);
    } else {
      // Update existing user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      console.log('Password updated for existing user:', email);
    }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error details:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'Token expired' });
    } else {
      res.status(400).json({ error: 'Error resetting password', details: error.message });
    }
  }
});

export default router; 