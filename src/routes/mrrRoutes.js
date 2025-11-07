import { Router } from "express";
import { callMRR } from "../services/mrrService.js";

const router = Router();

/**
 * 🧱 1. Create pool
 */
router.post("/pool", async (req, res) => {
  try {
    const { algo, name, host, port, user, pass } = req.body;
    if (!algo || !name || !host || !port || !user)
      return res.status(400).json({ error: "Missing required fields" });

    const data = await callMRR("/account/pool", "PUT", {
      type: algo,
      name,
      host,
      port,
      user,
      pass,
    });

    res.json({ message: "Pool created", data });
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

    const data = await callMRR("/account/pool/test", "PUT", {
      method: "full",
      type: algo,
      host,
      port,
      user,
      pass,
    });

    res.json({ message: "Pool test result", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ⚙️ 3. Get rigs list (filter by algo, region, price...)
 */
router.get("/rentals", async (req, res) => {
  try {
    const { algo, region } = req.query;
    if (!algo) return res.status(400).json({ error: "Missing algo param" });

    const query = new URLSearchParams({
      type: algo,
      count: "20",
      ...(region ? { [`region.${region}`]: "true" } : {}),
    });

    const data = await callMRR(`/rental?${query.toString()}`);
    res.json({ rigs: data });
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

    const data = await callMRR(`/rental/${rigId}/pool`, "PUT", {
      host,
      port,
      user,
      pass,
    });

    res.json({ message: "Rig rented successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📡 5. Check rental status
 */
router.get("/rental/:id", async (req, res) => {
  try {
    const data = await callMRR(`/rental/${req.params.id}`);
    res.json({ rentalStatus: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
