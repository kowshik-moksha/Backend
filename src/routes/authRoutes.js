// src/routes/authRoutes.js
import express from 'express';
import {
  register,
  verifyOtp,
  login,
  getProfile,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.get('/profile', protect, getProfile);

export default router;
