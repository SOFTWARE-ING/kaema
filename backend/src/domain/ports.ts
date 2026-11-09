import type { PrismaClient } from "../generated/prisma/client";

/** Ports used by application services. Infrastructure supplies the Prisma adapter. */
export interface DatabasePort {
  readonly client: PrismaClient;
}

export interface TokenPort {
  issue(user: { id: string; role: "CLIENT" | "ADMIN" }): Promise<{ accessToken: string; refreshToken: string }>;
  verifyAccess(token: string): Promise<{ sub: string; role: "CLIENT" | "ADMIN" }>;
}
