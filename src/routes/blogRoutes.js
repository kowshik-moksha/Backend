import express from 'express';
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  upload,
} from '../controllers/blogController.js';

const router = express.Router();

// Use multer fields for multiple file types
router.post(
  '/',
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'blogImageGallery', maxCount: 10 },
  ]),
  createBlog
);

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.put(
  '/:id',
  upload.fields([
    { name: 'bannerImage', maxCount: 1 },
    { name: 'blogImageGallery', maxCount: 10 },
  ]),
  updateBlog
);
router.delete('/:id', deleteBlog);

export default router;
