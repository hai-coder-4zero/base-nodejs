const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  validateRegister,
  validateLogin,
  validateRequest,
} = require("../middleware/validation");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  validateRegister,
  validateRequest,
  async (req, res) => {
    try {
      const { username, email, password, first_name, last_name } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const user = await User.create({
        username,
        email,
        password,
        first_name,
        last_name,
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });

      res.status(201).json({
        message: "User created successfully",
        token,
        user,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Login
router.post("/login", validateLogin, validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await User.validatePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side token removal)
router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "Logout successful" });
});

module.exports = router;
