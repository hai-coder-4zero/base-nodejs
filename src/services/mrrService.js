import dotenv from "dotenv";
import { MRR_API_KEY, MRR_API_SECRET, MRR_API_URL } from "../configs/env.js";
dotenv.config();

// MiningRigRentals
// https://www.miningrigrentals.com/api/v2

async function createMRRSignature(message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(MRR_API_SECRET),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function callMRR(endpoint, method = "GET", body = null) {
  const nonce = Date.now();
  const message = `${MRR_API_KEY}${nonce}${endpoint}`;
  const sign = await createMRRSignature(message);

  const headers = {
    "x-api-key": MRR_API_KEY,
    "x-api-nonce": nonce.toString(),
    "x-api-sign": sign,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${MRR_API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status}: ${result?.data?.message || "Unknown error"}`
    );
  }

  return result;
}

export { callMRR };
