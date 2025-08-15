const express = require("express");
const Post = require("../models/Post");
const { authenticate, authorize } = require("../middleware/auth");
const { validatePost, validateRequest } = require("../middleware/validation");

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const { page, limit, status, category, author, search } = req.query;
    const result = await Post.getAll({
      page,
      limit,
      status,
      category,
      author,
      search,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get popular posts
router.get("/popular", async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const posts = await Post.getPopular(limit);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create post
router.post(
  "/",
  authenticate,
  authorize("admin", "author"),
  validatePost,
  validateRequest,
  async (req, res) => {
    try {
      const postData = {
        ...req.body,
        author_id: req.user.id,
        slug:
          req.body.slug ||
          req.body.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
      };

      const post = await Post.create(postData);
      res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update post
router.put(
  "/:id",
  authenticate,
  authorize("admin", "author"),
  validatePost,
  validateRequest,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const existingPost = await Post.findById(postId);

      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user owns the post or is admin
      if (existingPost.author_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const post = await Post.update(postId, req.body);
      res.json({ message: "Post updated successfully", post });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Delete post
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "author"),
  async (req, res) => {
    try {
      const postId = req.params.id;
      const existingPost = await Post.findById(postId);

      if (!existingPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user owns the post or is admin
      if (existingPost.author_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      await Post.delete(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
