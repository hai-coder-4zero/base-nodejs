import { Router } from "express";
import { callMRR } from "../services/mrrService.js";

const router = Router();

function checkMissingFields(obj, fields, res) {
  for (const field of fields) {
    if (
      obj[field] === undefined ||
      obj[field] === null ||
      (typeof obj[field] === "string" && obj[field].trim() === "")
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return true;
    }
  }
  return false;
}

/**
 * 🧱 1. Create pool
 */
router.post("/pool", async (req, res) => {
  try {
    const { type, name, host, port, user, pass } = req.body;
    if (
      checkMissingFields(
        req.body,
        ["type", "name", "host", "port", "user"],
        res
      )
    )
      return;

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
    const { method, type, host, port, user, pass } = req.body;
    if (
      checkMissingFields(
        req.body,
        ["method", "type", "host", "port", "user", "pass"],
        res
      )
    )
      return;

    const result = await callMRR("/account/pool/test", "PUT", {
      method,
      type,
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
 * ⚙️ 3. Get rigs list (filter by type, region, price...)
 */
router.get("/rigs", async (req, res) => {
  try {
    const { type } = req.query;

    const query = new URLSearchParams({
      type,
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
 * 🤝 4. Rent rig
 */
router.post("/rental", async (req, res) => {
  try {
    const { rig, length, currency } = req.body;

    if (checkMissingFields(req.body, ["rig", "length", "currency"], res))
      return;

    const result = await callMRR("/rental", "PUT", {
      rig,
      length,
      currency,
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
 * 🤝 5. Rent rig with pool
 */
router.post("/rental-pool", async (req, res) => {
  try {
    const { rigId, host, port, user, pass, priority } = req.body;

    if (
      checkMissingFields(
        req.body,
        ["rigId", "host", "port", "user", "pass", "priority"],
        res
      )
    )
      return;

    const result = await callMRR(`/rental/${rigId}/pool`, "PUT", {
      host,
      port,
      user,
      pass,
      priority,
    });

    res.json({ message: "Rig rented with pool successfully", result });
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
 * 📡 6. Check rental status
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
