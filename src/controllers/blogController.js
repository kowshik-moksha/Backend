import Blog from '../models/Blog.js';
import { uploadToS3, deleteFromS3 } from '../config/awsConfig.js';
import multer from 'multer';

// Use multer memory storage (keeps file in buffer instead of disk)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Create a new blog with images
export const createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    let bannerImageUrl = null;
    let galleryUrls = [];

    // Upload banner image if provided
    if (req.files?.bannerImage?.[0]) {
      bannerImageUrl = await uploadToS3(
        req.files.bannerImage[0].buffer,
        req.files.bannerImage[0].originalname,
        req.files.bannerImage[0].mimetype,
        'blogs' // Specify folder name here
      );
    }

    // Upload gallery images if provided
    if (req.files?.blogImageGallery?.length > 0) {
      const uploadPromises = req.files.blogImageGallery.map((file) =>
        uploadToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          'blogs/gallery' // Subfolder for gallery images
        )
      );
      galleryUrls = await Promise.all(uploadPromises);
    }

    const blog = await Blog.create({
      title,
      content,
      author,
      bannerImage: bannerImageUrl,
      blogImageGallery: galleryUrls,
    });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all blogs
export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: 'Blog not found' });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update blog by ID (with optional new images)
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: 'Blog not found' });
    }

    const updateData = { ...req.body };

    // Upload new banner if provided and delete old one
    if (req.files?.bannerImage?.[0]) {
      // Delete old banner image from S3 if exists
      if (blog.bannerImage) {
        try {
          await deleteFromS3(blog.bannerImage);
        } catch (deleteError) {
          console.error(
            'Error deleting old banner image:',
            deleteError.message
          );
          // Continue with upload even if delete fails
        }
      }

      // Upload new banner image
      updateData.bannerImage = await uploadToS3(
        req.files.bannerImage[0].buffer,
        req.files.bannerImage[0].originalname,
        req.files.bannerImage[0].mimetype,
        'blogs'
      );
    }

    // Upload new gallery images if provided
    if (req.files?.blogImageGallery?.length > 0) {
      const uploadPromises = req.files.blogImageGallery.map((file) =>
        uploadToS3(
          file.buffer,
          file.originalname,
          file.mimetype,
          'blogs/gallery'
        )
      );
      const newGalleryUrls = await Promise.all(uploadPromises);

      // Combine with existing gallery images or replace based on your requirement
      updateData.blogImageGallery = [
        ...blog.blogImageGallery,
        ...newGalleryUrls,
      ];
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, data: updatedBlog });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete blog by ID and associated images from S3
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: 'Blog not found' });
    }

    // Delete banner image from S3 if exists
    if (blog.bannerImage) {
      try {
        await deleteFromS3(blog.bannerImage);
      } catch (deleteError) {
        console.error('Error deleting banner image:', deleteError.message);
      }
    }

    // Delete gallery images from S3 if exist
    if (blog.blogImageGallery && blog.blogImageGallery.length > 0) {
      try {
        const deletePromises = blog.blogImageGallery.map((imageUrl) =>
          deleteFromS3(imageUrl)
        );
        await Promise.allSettled(deletePromises); // Use allSettled to continue even if some deletions fail
      } catch (deleteError) {
        console.error('Error deleting gallery images:', deleteError.message);
      }
    }

    // Delete blog from database
    await Blog.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete specific image from blog gallery
export const deleteGalleryImage = async (req, res) => {
  try {
    const { blogId, imageUrl } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: 'Blog not found' });
    }

    // Delete image from S3
    try {
      await deleteFromS3(imageUrl);
    } catch (deleteError) {
      console.error('Error deleting image from S3:', deleteError.message);
      // Continue to remove from database even if S3 delete fails
    }

    // Remove image URL from blog's gallery array
    blog.blogImageGallery = blog.blogImageGallery.filter(
      (url) => url !== imageUrl
    );

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
