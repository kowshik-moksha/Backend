// src/models/Blog.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    bannerImage: {
      type: String,
    },
    blogImageGallery: {
      type: [String],
      default: [],
    },
    author: {
      type: String,
      default: 'Anonymous',
    },
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
