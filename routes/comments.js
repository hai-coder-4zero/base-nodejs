const express = require("express");
const { pool } = require("../configs/database");
const { authenticate, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get comments for a post
router.get("/post/:postId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT c.*, u.username as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ? AND c.status = 'approved'
      ORDER BY c.created_at DESC
    `,
      [req.params.postId]
    );

    res.json({ comments: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create comment
router.post(
  "/",
  [
    body("post_id").isInt().withMessage("Post ID is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("author_name")
      .optional()
      .isLength({ min: 1 })
      .withMessage("Author name is required for guest comments"),
    body("author_email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required for guest comments"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { post_id, content, parent_id, author_name, author_email } =
        req.body;
      let author_id = null;

      // Check if user is authenticated
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          author_id = decoded.id;
        } catch (err) {
          // Token invalid, continue as guest
        }
      }

      const [result] = await pool.execute(
        "INSERT INTO comments (post_id, author_id, author_name, author_email, content, parent_id) VALUES (?, ?, ?, ?, ?, ?)",
        [post_id, author_id, author_name, author_email, content, parent_id]
      );

      const [rows] = await pool.execute(
        `
      SELECT c.*, u.username as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `,
        [result.insertId]
      );

      res
        .status(201)
        .json({ message: "Comment created successfully", comment: rows[0] });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update comment status (admin only)
router.put(
  "/:id/status",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      await pool.execute("UPDATE comments SET status = ? WHERE id = ?", [
        status,
        req.params.id,
      ]);

      res.json({ message: "Comment status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Delete comment
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM comments WHERE id = ?", [
      req.params.id,
    ]);

    if (!rows[0]) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user owns the comment or is admin
    if (rows[0].author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.execute("DELETE FROM comments WHERE id = ?", [req.params.id]);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
