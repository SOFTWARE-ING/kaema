import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { HttpError, unauthorized } from "../domain/errors";

const secretValue = process.env.JWT_SECRET;
if (!secretValue || secretValue.length < 32) {
  throw new Error("JWT_SECRET doit contenir au moins 32 caractères.");
}
const secret = new TextEncoder().encode(secretValue);
const accessTtlSeconds = 15 * 60;
const refreshTtlMs = 30 * 24 * 60 * 60 * 1000;

export async function issueAccessToken(user: { id: string; role: "CLIENT" | "ADMIN" }) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${accessTtlSeconds}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (!payload.sub || (payload.role !== "CLIENT" && payload.role !== "ADMIN")) throw unauthorized();
    return { sub: payload.sub, role: payload.role } as const;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw unauthorized();
  }
}

export const newRefreshToken = () => randomBytes(48).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const refreshExpiresAt = () => new Date(Date.now() + refreshTtlMs);
export const hashGuestKey = (key: string) => createHash("sha256").update(key).digest("hex");

export function bearer(headers: Record<string, string | undefined>) {
  const value = headers.authorization;
  if (!value?.startsWith("Bearer ")) throw unauthorized();
  return value.slice(7);
}
