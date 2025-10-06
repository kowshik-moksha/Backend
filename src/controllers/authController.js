// src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwtConfig.js';
import { generateOtp } from '../utils/otp.js';
import {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
} from '../services/emailService.js';
// -------------------- JWT TOKEN GENERATION --------------------
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

// -------------------- REGISTER USER (with OTP verification) --------------------
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already exists' });

    // Generate OTP
    const otp = generateOtp();

    // Capture metadata
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'];

    // Create user with OTP and expiry
    const user = await User.create({
      name,
      email,
      password,
      ip: ipAddress,
      device: userAgent,
      location: { country: null, city: null },
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000, // 5 min expiry
    });

    // Send OTP Email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.',
      data: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- VERIFY OTP (Signup) --------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid → clear OTP fields
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Signup successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        ip: user.ip,
        device: user.device,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// -------------------- LOGIN --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);

    // Save token in DB
    user.token = token;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- FORGOT PASSWORD (Send OTP) --------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    await sendPasswordResetOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- RESET PASSWORD (Verify OTP & Update Password) --------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message:
        'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Protected test route
export const getProfile = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};
