// src/routes/cartRoutes.js
import express from 'express';
import {
  addToCart,
  getCartByUserId,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCartByUserId);
router.delete('/remove', removeFromCart);
router.delete('/clear', clearCart);

export default router;
