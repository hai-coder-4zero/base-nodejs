import { Router } from "express";
import userRoutes from "./userRoutes.js";
import emailSdkRoutes from "./emailSdkRoutes.js";
import emailSmtpRoutes from "./emailSmtpRoutes.js";
import mrrRoutes from "./mrrRoutes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/email-sdk", emailSdkRoutes);
router.use("/email-smtp", emailSmtpRoutes);
router.use("/mrr", mrrRoutes);

export default router;
