// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import chatHistoryRoutes from './routes/chatHistoryRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Blog CRUD routes
app.use('/api/blogs', blogRoutes);
// Auth CRUD
app.use('/api/auth', authRoutes);
// Chat Boat
app.use('/api/chat', chatHistoryRoutes);
// Product CRUD
app.use('/api/products', productRoutes);
export default app;
