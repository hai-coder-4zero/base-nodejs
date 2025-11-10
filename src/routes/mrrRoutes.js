import { Router } from "express";
import { callMRR } from "../services/mrrService.js";

const router = Router();

/**
 * 🧱 1. Create pool
 */
router.post("/pool", async (req, res) => {
  try {
    const { type, name, host, port, user, pass } = req.body;
    if (!type || !name || !host || !port || !user)
      return res.status(400).json({ error: "Missing required fields" });

    const result = await callMRR("/account/pool", "PUT", {
      type,
      name,
      host,
      port,
      user,
      pass,
    });

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    res.json({ message: "Pool created", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧪 2. Test pool
 */
router.post("/pool/test", async (req, res) => {
  try {
    const { algo, host, port, user, pass } = req.body;
    if (!algo || !host || !port)
      return res.status(400).json({ error: "Missing required fields" });

    const result = await callMRR("/account/pool/test", "PUT", {
      method: "full",
      type: algo,
      host,
      port,
      user,
      pass,
    });

    res.json({ message: "Pool test result", result });
    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ⚙️ 3. Get rigs list (filter by algo, region, price...)
 */
router.get("/rigs", async (req, res) => {
  try {
    const { algo, region } = req.query;
    if (!algo) return res.status(400).json({ error: "Missing algo param" });

    const query = new URLSearchParams({
      type: algo,
      count: "20",
      ...(region ? { [`region.${region}`]: "true" } : {}),
    });

    const result = await callMRR(`/rig?${query.toString()}`);
    res.json({ rigs: result });
    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🤝 4. Rent rig with pool
 */
router.post("/rental", async (req, res) => {
  try {
    const { rigId, host, port, user, pass } = req.body;
    if (!rigId || !host || !port || !user)
      return res.status(400).json({ error: "Missing required fields" });

    const result = await callMRR(`/rental/${rigId}/pool`, "PUT", {
      host,
      port,
      user,
      pass,
    });

    res.json({ message: "Rig rented successfully", result });
    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📡 5. Check rental status
 */
router.get("/rental/:id", async (req, res) => {
  try {
    const result = await callMRR(`/rental/${req.params.id}`);
    res.json({ rentalStatus: result });
    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
