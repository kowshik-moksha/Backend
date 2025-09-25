// src/routes/blogRoutes.js
import express from 'express';
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';

const router = express.Router();

router.post('/', createBlog); // Create
router.get('/', getBlogs); // Read all
router.get('/:id', getBlogById); // Read one
router.put('/:id', updateBlog); // Update
router.delete('/:id', deleteBlog); // Delete

export default router;
