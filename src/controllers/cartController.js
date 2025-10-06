import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendCartReminderEmail } from '../services/emailService.js';

// Helper: Calculate totals
const calculateTotals = (items) => {
  let totalQuantity = 0;
  let totalPrice = 0;

  items.forEach((item) => {
    totalQuantity += item.quantity;
    totalPrice += item.price * item.quantity;
  });

  return { totalQuantity, totalPrice };
};

// Add or Update Item in Cart
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    const totals = calculateTotals(cart.items);
    cart.totalQuantity = totals.totalQuantity;
    cart.totalPrice = totals.totalPrice;

    await cart.save();

    // ✅ Fetch user email automatically
    const user = await User.findById(userId);
    if (user && user.email) {
      // Send reminder after 1 minute
      setTimeout(async () => {
        try {
          const stillInCart = await Cart.findOne({ user: userId }).populate(
            'items.product'
          );

          if (stillInCart && stillInCart.items.length > 0) {
            await sendCartReminderEmail(
              user.email,
              stillInCart.items[0].product
            );
            console.log(
              `Cart reminder sent to ${user.email} for ${stillInCart.items[0].product.name}`
            );
          }
        } catch (err) {
          console.error('Error sending reminder email:', err.message);
        }
      }, 60 * 1000); // 1 minute delay
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Cart by User ID
export const getCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate(
      'items.product'
    );
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove Item from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    const totals = calculateTotals(cart.items);
    cart.totalQuantity = totals.totalQuantity;
    cart.totalPrice = totals.totalPrice;

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    cart.totalQuantity = 0;
    cart.totalPrice = 0;

    await cart.save();
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
