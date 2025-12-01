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
 * 🗑️  Delete profile
 */
router.delete("/account/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID",
      });
    }

    const result = await callMRR(`/account/profile/${id}`, "DELETE");

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase()?.includes("not authenticated")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please check your MRR API key.",
      });
    }

    if (!result?.success) {
      return res.status(400).json({
        success: false,
        message: result?.data?.message || "Error",
      });
    }

    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📄  Get list of profiles
 * GET /profiles?algo=scrypt
 */
router.get("/account/profiles", async (req, res) => {
  try {
    const result = await callMRR(`/account/profile`);

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📘 GET /account/profile/:id
 * Get profile detail by profile ID
 */
router.get("/account/profile/:id", async (req, res) => {
  try {
    const profileId = req.params.id;

    if (!profileId) {
      return res.status(400).json({ error: "Missing profileId" });
    }

    const result = await callMRR(`/account/profile/${profileId}`);

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📦  Get list of pools created in MRR account
 * GET /account/pools
 */
router.get("/account/pools", async (req, res) => {
  try {
    const result = await callMRR("/account/pool");

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧱  Create mining profile
 */
router.post("/account/profile", async (req, res) => {
  try {
    const { name, algo } = req.body;

    if (checkMissingFields(req.body, ["name", "algo"], res)) return;

    const result = await callMRR("/account/profile", "PUT", {
      name,
      algo,
    });

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧱 Create pool
 */
router.post("/account/pool", async (req, res) => {
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

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧪 Test pool
 */
router.post("/account/pool/test", async (req, res) => {
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

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧱 Add pool to existing profile
 */
router.post("/account/profile/:id/pool", async (req, res) => {
  try {
    const profileId = req.params.id;
    const { poolId, priority } = req.body;

    if (checkMissingFields(req.body, ["poolId", "priority"], res)) return;

    const result = await callMRR(`/account/profile/${profileId}`, "PUT", {
      poolid: poolId,
      priority,
    });

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🗑️  Delete one or multiple pools
 * DELETE /pools/:ids
 * Example:
 *   /pools/79817
 *   /pools/79817;79818;79819
 */
router.delete("/account/pools/:ids", async (req, res) => {
  try {
    const { ids } = req.params;

    if (!ids || typeof ids !== "string") {
      return res.status(400).json({ error: "Invalid pool IDs" });
    }

    const result = await callMRR(`/account/pool/${ids}`, "DELETE");

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Check your MRR API credentials",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ⚙️ Get rigs list (filter by type, region, price...)
 */
router.get("/rigs", async (req, res) => {
  try {
    const { type } = req.query;

    const query = new URLSearchParams({
      type,
    });

    const result = await callMRR(`/rig?${query.toString()}`);

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧲 Get single rig details
 */
router.get("/rig/:id", async (req, res) => {
  try {
    const rigId = req.params.id;

    if (!rigId || rigId.trim() === "") {
      return res.status(400).json({ error: "Missing rigId" });
    }

    const result = await callMRR(`/rig/${rigId}`, "GET");

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🤝 Rent rig
 */
router.post("/rental", async (req, res) => {
  try {
    const { rig, length, profile, currency, rate } = req.body;

    if (
      checkMissingFields(
        req.body,
        ["rig", "length", "profile", "currency"],
        res
      )
    )
      return;

    const payload = {
      rig,
      length,
      profile,
      currency,
    };

    if (rate && rate.type && rate.price !== undefined) {
      payload.rate = {
        type: rate.type,
        price: rate.price,
      };
    }

    const result = await callMRR("/rental", "PUT", payload);

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🤝 Rent rig with pool
 */
router.post("/rental-pool", async (req, res) => {
  try {
    const { rentalId, host, port, user, pass, priority } = req.body;

    if (
      checkMissingFields(
        req.body,
        ["rentalId", "host", "port", "user", "pass", "priority"],
        res
      )
    )
      return;

    const result = await callMRR(
      `/rental/${rentalId}/pool/${priority}`,
      "PUT",
      {
        host,
        port,
        user,
        pass,
      }
    );

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📡 Check rental status
 */
router.get("/rental/:id", async (req, res) => {
  try {
    const result = await callMRR(`/rental/${req.params.id}`);

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 📌 Get pools assigned to rental(s)
 * GET /rental-pools/:ids
 * Example: /rental-pools/17
 *          /rental-pools/26996;27004
 */
router.get("/rental-pools/:ids", async (req, res) => {
  try {
    const { ids } = req.params;

    if (!ids || typeof ids !== "string") {
      return res.status(400).json({ error: "Invalid rental IDs" });
    }

    const result = await callMRR(`/rental/${ids}/pool`);

    if (
      result?.success === false &&
      result?.data?.message?.toLowerCase().includes("not authenticated")
    ) {
      return res.status(401).json({
        error: "Not Authenticated: Please check your MRR API credentials.",
      });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: { message: result?.data?.message || "Error" },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
