import type { DatabasePort } from "../../domain/ports";
import { prisma } from "./db";

/** Persistence adapter: application code receives a port, not a database singleton. */
export const prismaRepository: DatabasePort = { client: prisma };
