import crypto from "crypto";

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function getOtpSecret() {
  const secret = process.env.OTP_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("OTP_SECRET must be set and contain at least 32 characters");
  }
  return secret;
}

export function hashOtp(email, code) {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${normalizeEmail(email)}:${String(code)}`)
    .digest("hex");
}

export function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" ||
      !/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
