// src/routes/chatHistoryRoutes.js
import express from 'express';
import { getChatHistoryByUserId } from '../controllers/chatBotController/chatbotController.js';

const router = express.Router();

router.get('/history/:userId', getChatHistoryByUserId);

export default router;
