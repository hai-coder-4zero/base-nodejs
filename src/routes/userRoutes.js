import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateUser } from "../middlewares/validator.js";

const router = Router();

router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.post("/", validateUser, createUser);
router.put("/:id", authMiddleware, validateUser, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
