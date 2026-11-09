import { api } from "./infra/http/api";
import { prisma } from "./infra/persistence/db";

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT invalide.");

api.listen({ port, hostname: "0.0.0.0", maxRequestBodySize: 310 * 1024 * 1024, idleTimeout: 255 });
console.log(`KAEMA API listening on port ${api.server?.port ?? port}`);

const shutdown = async () => {
  await api.stop(true);
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
