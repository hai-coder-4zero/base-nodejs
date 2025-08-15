const express = require("express");
const { pool } = require("../configs/database");
const { authenticate, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, COUNT(p.id) as post_count 
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json({ categories: rows });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get category by slug
router.get("/:slug", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM categories WHERE slug = ?",
      [req.params.slug]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ category: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create category
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("slug")
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, slug, description } = req.body;
      const [result] = await pool.execute(
        "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
        [name, slug, description]
      );

      const [rows] = await pool.execute(
        "SELECT * FROM categories WHERE id = ?",
        [result.insertId]
      );
      res
        .status(201)
        .json({ message: "Category created successfully", category: rows[0] });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update category
router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    await pool.execute(
      "UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?",
      [name, slug, description, req.params.id]
    );

    const [rows] = await pool.execute("SELECT * FROM categories WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ message: "Category updated successfully", category: rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete category
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await pool.execute("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
