// src/models/Product.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    brand: { type: String },
    ratings: { type: Number, default: 0 },
    reviews: [reviewSchema],
    attributes: { type: Object }, // e.g., { color: "Red", size: "L" }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
