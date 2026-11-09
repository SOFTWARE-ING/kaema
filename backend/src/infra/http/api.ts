import { Elysia, t } from "elysia";
import { cors } from "@elysia/cors";
import { openapi } from "@elysia/openapi";
import { mkdir, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, resolve } from "node:path";
import { AuthService } from "../../application/auth-service";
import { CommerceService } from "../../application/commerce-service";
import { badRequest, conflict, forbidden, notFound, serviceUnavailable, unauthorized } from "../../domain/errors";
import { prismaRepository } from "../persistence/prisma-repository";
import { bearer, hashGuestKey, verifyAccessToken } from "../../shared/security";
import { readMedia, removeMedia, saveMedia, saveMediaFile } from "../storage/media-storage";

const db = prismaRepository.client;
const authService = new AuthService(prismaRepository);
const commerceService = new CommerceService(prismaRepository);
const originList = (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",").map((origin) => origin.trim());
const cookieSameSite = (process.env.COOKIE_SAME_SITE ?? "Strict").toLowerCase();
if (!["strict", "lax", "none"].includes(cookieSameSite)) throw new Error("COOKIE_SAME_SITE doit valoir Strict, Lax ou None.");
const fixedWindow = new Map<string, { count: number; resetAt: number }>();
const galleryTempDirectory = resolve(process.env.GALLERY_TEMP_DIR ?? "/tmp/kaema-gallery");
const imageFormats = {
  "image/jpeg": { extension: "jpg", signature: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  "image/png": { extension: "png", signature: (bytes: Uint8Array) => bytes.subarray(0, 8).join(",") === "137,80,78,71,13,10,26,10" },
  "image/webp": { extension: "webp", signature: (bytes: Uint8Array) => new TextDecoder().decode(bytes.subarray(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.subarray(8, 12)) === "WEBP" },
  "image/avif": { extension: "avif", signature: (bytes: Uint8Array) => new TextDecoder().decode(bytes.subarray(4, 12)).includes("ftyp") && /avi[fs]/.test(new TextDecoder().decode(bytes.subarray(8, 16)) ) },
} as const;
const galleryImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

function galleryFilename(mediaPath: string, mediaType: "IMAGE" | "VIDEO") {
  const match = /^\/uploads\/gallery\/([\da-f-]{36})\.(jpg|png|webp|avif|mp4|webm)$/.exec(mediaPath);
  if (!match) return null;
  const video = /\.(mp4|webm)$/.test(mediaPath);
  if (video !== (mediaType === "VIDEO")) return null;
  return `${match[1]}.${match[2]}`;
}

async function removeGalleryFile(mediaPath: string, mediaType: "IMAGE" | "VIDEO") {
  const filename = galleryFilename(mediaPath, mediaType);
  if (filename) await removeMedia("gallery", filename).catch(() => undefined);
}

function transcodeVideo(source: string, destination: string) {
  return new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(process.env.FFMPEG_PATH ?? "ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-i", source,
      "-map", "0:v:0", "-map", "0:a:0?", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
      "-vf", "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-f", "mp4", destination,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => { stderr = `${stderr}${chunk}`.slice(-4000); });
    child.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") rejectPromise(serviceUnavailable("La conversion vidéo nécessite FFmpeg installé sur le serveur."));
      else rejectPromise(error);
    });
    child.once("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(badRequest(stderr.includes("Stream map") ? "Le fichier ne contient pas de piste vidéo lisible." : "FFmpeg ne peut pas lire ce fichier vidéo."));
    });
  });
}

function identify(request: Request, server?: { requestIP(request: Request): { address: string } | null }) {
  return server?.requestIP(request)?.address ?? "unknown";
}

function isRateLimited(key: string, limit = 120, windowMs = 60_000) {
  const now = Date.now();
  const previous = fixedWindow.get(key);
  if (!previous || previous.resetAt <= now) {
    fixedWindow.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  previous.count += 1;
  return previous.count > limit;
}

async function actor(headers: Record<string, string | undefined>, requiredRole?: "CLIENT" | "ADMIN") {
  const token = await verifyAccessToken(bearer(headers));
  const user = await db.user.findUnique({ where: { id: token.sub }, select: { id: true, role: true } });
  if (!user) throw unauthorized();
  if (requiredRole && user.role !== requiredRole) throw forbidden();
  return user;
}

async function chatOwner(headers: Record<string, string | undefined>) {
  if (headers.authorization) return { userId: (await actor(headers, "CLIENT")).id, guestKey: undefined as string | undefined };
  const guestId = headers["x-kaema-guest"];
  if (!guestId || guestId.length < 20 || guestId.length > 100) throw badRequest("Identifiant de conversation manquant.");
  return { userId: undefined as string | undefined, guestKey: hashGuestKey(guestId) };
}

function refreshCookie(token: string, clear = false) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const maxAge = clear ? 0 : 30 * 24 * 60 * 60;
  return `kaema_refresh=${clear ? "" : token}; Path=/api/auth; HttpOnly${secure}; SameSite=${cookieSameSite}; Max-Age=${maxAge}`;
}

function readRefreshCookie(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith("kaema_refresh="));
  return cookie?.slice("kaema_refresh=".length);
}

function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !originList.includes(origin)) throw forbidden();
}

function authResponse(result: { user: unknown; tokens: { accessToken: string; refreshToken: string } }, set: { headers: Record<string, string | number | undefined> }) {
  set.headers["Set-Cookie"] = refreshCookie(result.tokens.refreshToken);
  return { user: result.user, accessToken: result.tokens.accessToken };
}

const productInput = t.Object({
  name: t.String({ minLength: 2, maxLength: 120 }),
  description: t.String({ maxLength: 4000 }),
  price: t.Integer({ minimum: 0, maximum: 2_000_000_000 }),
  imageUrl: t.Optional(t.String({ maxLength: 2048 })),
  stock: t.Integer({ minimum: 0, maximum: 100_000 }),
  published: t.Boolean(),
});

export const api = new Elysia({ name: "kaema-api" })
  .use(cors({ origin: originList, methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization", "X-Kaema-Guest"], credentials: true }))
  .use(openapi({ documentation: { info: { title: "KAEMA API", version: "1.0.0", description: "API du site KAEMA RÉNO & DESIGN" } } }))
  .onBeforeHandle(({ request, set, server }) => {
    const authRoute = new URL(request.url).pathname.includes("/auth/");
    const key = `${identify(request, server ?? undefined)}:${authRoute ? "auth" : "api"}`;
    const limit = authRoute ? 20 : 120;
    if (isRateLimited(key, limit)) {
      set.status = 429;
      return { error: "Trop de requêtes. Réessayez dans une minute." };
    }
    if (fixedWindow.size > 20_000) {
      for (const [id, window] of fixedWindow) if (window.resetAt < Date.now()) fixedWindow.delete(id);
    }
  })
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Données invalides.", details: error.message };
    }
    const status = "status" in error && typeof error.status === "number" ? error.status : 500;
    set.status = status as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503;
    if (status >= 500) console.error("API error", error);
    return { error: status >= 500 && status !== 503 ? "Erreur interne du serveur." : error instanceof Error ? error.message : "Requête invalide." };
  })
  .get("/health", () => ({ status: "ok", service: "kaema-api", timestamp: new Date().toISOString() }), { detail: { summary: "État de santé de l'API" } })
  .get("/uploads/products/:filename", async ({ params, set }) => {
    if (!/^[\da-f-]{36}\.(?:jpg|png|webp|avif)$/.test(params.filename)) throw notFound("Image introuvable.");
    const extension = params.filename.split(".").at(-1);
    const contentType = ({ jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" } as const)[extension as "jpg" | "png" | "webp" | "avif"];
    set.headers["Cache-Control"] = "public, max-age=31536000, immutable";
    set.headers["X-Content-Type-Options"] = "nosniff";
    const image = await readMedia("products", params.filename, contentType, null);
    if (!image) throw notFound("Image introuvable.");
    return image;
  }, { detail: { summary: "Afficher une image du showroom" } })
  .get("/uploads/gallery/:filename", async ({ params, request }) => {
    if (!/^[\da-f-]{36}\.(?:jpg|png|webp|avif|mp4|webm)$/.test(params.filename)) throw notFound("Média introuvable.");
    const extension = params.filename.split(".").at(-1);
    const contentType = ({ jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", mp4: "video/mp4", webm: "video/webm" } as const)[extension as "jpg" | "png" | "webp" | "avif" | "mp4" | "webm"];
    const media = await readMedia("gallery", params.filename, contentType, request.headers.get("range"));
    if (!media) throw notFound("Média introuvable.");
    return media;
  }, { detail: { summary: "Servir les images et vidéos de la galerie avec prise en charge du streaming HTTP Range" } })
  .group("/api", (app) => app
    .group("/auth", (auth) => auth
      .post("/register", async ({ body, set }) => authResponse(await authService.register(body), set), {
        body: t.Object({ name: t.String({ minLength: 2, maxLength: 120 }), email: t.String({ format: "email", maxLength: 254 }), phone: t.Optional(t.String({ maxLength: 40 })), password: t.String({ minLength: 12, maxLength: 128 }) }),
        detail: { summary: "Créer un compte client" },
      })
      .post("/login", async ({ body, set }) => authResponse(await authService.login(body.email, body.password), set), {
        body: t.Object({ email: t.String({ format: "email", maxLength: 254 }), password: t.String({ minLength: 1, maxLength: 128 }) }),
        detail: { summary: "Connexion client ou administrateur" },
      })
      .post("/refresh", async ({ request, set }) => {
        assertTrustedOrigin(request);
        const token = readRefreshCookie(request);
        if (!token) throw unauthorized();
        return authResponse(await authService.refresh(token), set);
      }, {
        detail: { summary: "Renouveler les jetons d'accès" },
      })
      .post("/logout", async ({ request, set }) => {
        assertTrustedOrigin(request);
        await authService.logout(readRefreshCookie(request));
        set.headers["Set-Cookie"] = refreshCookie("", true);
        return { ok: true };
      }, {
        detail: { summary: "Révoquer le jeton de renouvellement" },
      })
      .get("/me", async ({ headers }) => authService.me((await actor(headers)).id), { detail: { summary: "Profil connecté" } })
    )
    .post("/appointments", async ({ body, headers }) => {
      if ([body.clientName, body.contact, body.service, body.slot].some((value) => !value.trim())) throw badRequest("Les champs nom, contact, service et créneau sont obligatoires.");
      const parsedDate = new Date(`${body.date}T00:00:00.000Z`);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date(new Date().toISOString().slice(0, 10))) throw badRequest("La date doit être future.");
      const userId = headers.authorization ? (await actor(headers, "CLIENT")).id : undefined;
      return db.appointment.create({ data: {
        userId,
        clientName: body.clientName.trim(), contact: body.contact.trim(), service: body.service.trim(), date: parsedDate,
        slot: body.slot, message: body.message?.trim() ?? "", channel: body.channel ?? "WEBSITE",
      } });
    }, {
      body: t.Object({ clientName: t.String({ minLength: 2, maxLength: 120 }), contact: t.String({ minLength: 5, maxLength: 120 }), service: t.String({ minLength: 2, maxLength: 120 }), date: t.String({ format: "date" }), slot: t.String({ minLength: 3, maxLength: 60 }), message: t.Optional(t.String({ maxLength: 3000 })), channel: t.Optional(t.Union([t.Literal("EMAIL"), t.Literal("WHATSAPP"), t.Literal("CHAT"), t.Literal("WEBSITE")])) }),
      detail: { summary: "Demander un rendez-vous ou un devis" },
    })
    .get("/client/appointments", async ({ headers }) => {
      const user = await actor(headers, "CLIENT");
      return db.appointment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    })
    .get("/showroom/products", () => commerceService.listPublishedProducts(), { detail: { summary: "Lister les produits publiés" } })
    .get("/gallery", () => db.galleryAsset.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }), { detail: { summary: "Lister les médias publiés de la galerie" } })
    .post("/gallery/:id/view", async ({ params }) => {
      const updated = await db.galleryAsset.updateMany({ where: { id: params.id, published: true }, data: { viewCount: { increment: 1 } } });
      if (!updated.count) throw notFound("Média introuvable.");
      return db.galleryAsset.findUniqueOrThrow({ where: { id: params.id }, select: { viewCount: true } });
    }, { detail: { summary: "Compter une vue d'image ou de vidéo" } })
    .post("/gallery/:id/order", async ({ params }) => {
      const updated = await db.galleryAsset.updateMany({ where: { id: params.id, published: true }, data: { orderCount: { increment: 1 } } });
      if (!updated.count) throw notFound("Média introuvable.");
      return db.galleryAsset.findUniqueOrThrow({ where: { id: params.id }, select: { orderCount: true } });
    }, { detail: { summary: "Compter une demande de commande ou d'intérêt" } })
    .post("/showroom/orders", async ({ body }) => commerceService.placeOrder(body), {
      body: t.Object({ productId: t.String({ minLength: 1, maxLength: 40 }), quantity: t.Integer({ minimum: 1, maximum: 100 }), customerName: t.String({ minLength: 2, maxLength: 120 }), customerContact: t.String({ minLength: 5, maxLength: 120 }), message: t.Optional(t.String({ maxLength: 2000 })) }),
      detail: { summary: "Créer une demande de commande" },
    })
    .get("/suggestions", async () => {
      const suggestions = await db.suggestion.findMany({ include: { _count: { select: { votes: true } } }, orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }] });
      return suggestions.map(({ userId: _userId, _count, ...suggestion }) => ({ ...suggestion, votes: _count.votes }));
    }, { detail: { summary: "Lister les suggestions communautaires" } })
    .post("/suggestions", async ({ body }) => {
      if ([body.author, body.content, body.category].some((value) => !value.trim())) throw badRequest("Auteur, suggestion et catégorie sont obligatoires.");
      const suggestion = await db.suggestion.create({ data: { author: body.author.trim(), content: body.content.trim(), category: body.category.trim() } });
      return { ...suggestion, votes: 0 };
    }, {
      body: t.Object({ author: t.String({ minLength: 2, maxLength: 100 }), content: t.String({ minLength: 5, maxLength: 1000 }), category: t.String({ minLength: 2, maxLength: 80 }) }),
      detail: { summary: "Proposer une suggestion" },
    })
    .post("/suggestions/:id/vote", async ({ params, headers }) => {
      const suggestion = await db.suggestion.findUnique({ where: { id: params.id }, select: { id: true } });
      if (!suggestion) throw notFound("Suggestion introuvable.");
      const guestId = headers["x-kaema-guest"];
      if (!guestId || guestId.length < 20 || guestId.length > 100) throw badRequest("Identifiant de vote manquant.");
      const voterKey = hashGuestKey(guestId);
      try { await db.suggestionVote.create({ data: { suggestionId: params.id, voterKey } }); }
      catch (error) { if ((error as { code?: string }).code === "P2002") throw conflict("Vous avez déjà voté pour cette suggestion."); throw error; }
      return { votes: await db.suggestionVote.count({ where: { suggestionId: params.id } }) };
    }, { detail: { summary: "Voter pour une suggestion" } })
    .get("/client/chat/messages", async ({ headers }) => {
      const owner = await chatOwner(headers);
      const conversation = await db.chatConversation.findFirst({ where: owner });
      if (!conversation) return { conversationId: null, messages: [] };
      return { conversationId: conversation.id, messages: await db.chatMessage.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "asc" } }) };
    })
    .post("/client/chat/messages", async ({ headers, body }) => {
      const owner = await chatOwner(headers);
      const conversation = owner.userId
        ? await db.chatConversation.upsert({ where: { userId: owner.userId }, create: { userId: owner.userId }, update: {} })
        : await db.chatConversation.upsert({ where: { guestKey: owner.guestKey! }, create: { guestKey: owner.guestKey! }, update: {} });
      const message = await db.chatMessage.create({ data: { conversationId: conversation.id, sender: owner.userId ?? "guest", senderRole: "CLIENT", text: body.text.trim() } });
      await db.chatConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
      return message;
    }, { body: t.Object({ text: t.String({ minLength: 1, maxLength: 4000 }) }) })
    .group("/admin", (admin) => admin
      .post("/uploads/gallery", async ({ headers, body }) => {
        await actor(headers, "ADMIN");
        const file = body.file;
        if (file.type.startsWith("image/")) {
          if (file.size > 8 * 1024 * 1024) throw badRequest("L'image ne doit pas dépasser 8 Mo.");
          const format = imageFormats[file.type as keyof typeof imageFormats];
          if (!format) throw badRequest("Formats image acceptés : JPEG, PNG, WebP ou AVIF.");
          const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
          if (!format.signature(bytes)) throw badRequest("Le fichier ne correspond pas à une image valide.");
          const filename = `${crypto.randomUUID()}.${format.extension}`;
          await saveMedia("gallery", filename, file, file.type);
          return { mediaPath: `/uploads/gallery/${filename}`, mediaType: "IMAGE" };
        }
        if (!file.type.startsWith("video/") && file.type !== "application/octet-stream" && file.type !== "") throw badRequest("Choisissez un fichier image ou vidéo reconnu.");
        const extension = extname(file.name).slice(1).toLowerCase();
        if (!/^[a-z0-9]{2,8}$/.test(extension)) throw badRequest("Le fichier vidéo doit avoir une extension valide.");
        await mkdir(galleryTempDirectory, { recursive: true });
        const mediaId = crypto.randomUUID();
        const sourcePath = resolve(galleryTempDirectory, `${mediaId}.upload`);
        const temporaryOutput = resolve(galleryTempDirectory, `${mediaId}.processing.mp4`);
        const finalFilename = `${mediaId}.mp4`;
        try {
          await Bun.write(sourcePath, file);
          await transcodeVideo(sourcePath, temporaryOutput);
          await saveMediaFile("gallery", finalFilename, temporaryOutput, "video/mp4");
        } finally {
          await Promise.all([unlink(sourcePath).catch(() => undefined), unlink(temporaryOutput).catch(() => undefined)]);
        }
        return { mediaPath: `/uploads/gallery/${finalFilename}`, mediaType: "VIDEO" };
      }, {
        body: t.Object({ file: t.File({ type: [...galleryImageTypes, "video/*", "application/octet-stream"], maxSize: "300m" }) }),
        detail: { summary: "Téléverser une image ou vidéo de galerie (images 8 Mo, vidéos 300 Mo max.)" },
      })
      .post("/uploads/products", async ({ headers, body }) => {
        await actor(headers, "ADMIN");
        const file = body.file;
        const format = imageFormats[file.type as keyof typeof imageFormats];
        if (!format) throw badRequest("Format non pris en charge. Utilisez JPEG, PNG, WebP ou AVIF.");
        const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
        if (!format.signature(bytes)) throw badRequest("Le fichier ne correspond pas à une image valide.");
        const filename = `${crypto.randomUUID()}.${format.extension}`;
        await saveMedia("products", filename, file, file.type);
        return { imageUrl: `/uploads/products/${filename}` };
      }, {
        body: t.Object({ file: t.File({ type: ["image/jpeg", "image/png", "image/webp", "image/avif"], maxSize: "8m" }) }),
        detail: { summary: "Téléverser une image produit (admin)" },
      })
      .get("/dashboard", async ({ headers }) => {
        await actor(headers, "ADMIN");
        const [appointments, orders, suggestions, products, clients, gallery] = await Promise.all([
          db.appointment.count({ where: { status: "PENDING" } }), db.productOrder.count({ where: { status: "NEW" } }),
          db.suggestion.count(), db.showroomProduct.count(), db.user.count({ where: { role: "CLIENT" } }),
          db.galleryAsset.aggregate({ _sum: { viewCount: true, orderCount: true } }),
        ]);
        return { pendingAppointments: appointments, newOrders: orders, suggestions, products, clients, galleryViews: gallery._sum.viewCount ?? 0, galleryOrders: gallery._sum.orderCount ?? 0 };
      })
      .get("/appointments", async ({ headers, query }) => {
        await actor(headers, "ADMIN");
        return db.appointment.findMany({ where: query.status ? { status: query.status as "PENDING" | "CONFIRMED" | "CANCELLED" } : undefined, orderBy: { createdAt: "desc" }, take: 200 });
      }, { query: t.Object({ status: t.Optional(t.Union([t.Literal("PENDING"), t.Literal("CONFIRMED"), t.Literal("CANCELLED")])) }) })
      .patch("/appointments/:id", async ({ headers, params, body }) => {
        await actor(headers, "ADMIN");
        const updated = await db.appointment.updateMany({ where: { id: params.id }, data: { status: body.status } });
        if (!updated.count) throw notFound("Rendez-vous introuvable.");
        return db.appointment.findUnique({ where: { id: params.id } });
      }, { body: t.Object({ status: t.Union([t.Literal("PENDING"), t.Literal("CONFIRMED"), t.Literal("CANCELLED")]) }) })
      .delete("/appointments/:id", async ({ headers, params, set }) => {
        await actor(headers, "ADMIN");
        const deleted = await db.appointment.deleteMany({ where: { id: params.id } });
        if (!deleted.count) throw notFound("Rendez-vous introuvable.");
        set.status = 204; return null;
      })
      .get("/products", async ({ headers }) => { await actor(headers, "ADMIN"); return db.showroomProduct.findMany({ orderBy: { createdAt: "desc" } }); })
      .post("/products", async ({ headers, body }) => { await actor(headers, "ADMIN"); return db.showroomProduct.create({ data: body }); }, { body: productInput })
      .patch("/products/:id", async ({ headers, params, body }) => {
        await actor(headers, "ADMIN");
        const updated = await db.showroomProduct.updateMany({ where: { id: params.id }, data: body });
        if (!updated.count) throw notFound("Produit introuvable.");
        return db.showroomProduct.findUnique({ where: { id: params.id } });
      }, { body: t.Partial(productInput) })
      .delete("/products/:id", async ({ headers, params, set }) => {
        await actor(headers, "ADMIN");
        try { await db.showroomProduct.delete({ where: { id: params.id } }); }
        catch (error) {
          if ((error as { code?: string }).code === "P2025") throw notFound("Produit introuvable.");
          if ((error as { code?: string }).code === "P2003") throw conflict("Ce produit est déjà associé à une commande et ne peut pas être supprimé.");
          throw error;
        }
        set.status = 204; return null;
      })
      .get("/gallery", async ({ headers }) => {
        await actor(headers, "ADMIN");
        return db.galleryAsset.findMany({ orderBy: { createdAt: "desc" } });
      })
      .post("/gallery", async ({ headers, body }) => {
        await actor(headers, "ADMIN");
        if (!galleryFilename(body.mediaPath, body.mediaType)) throw badRequest("Le chemin du média téléversé est invalide.");
        return db.galleryAsset.create({ data: body });
      }, { body: t.Object({ title: t.String({ minLength: 2, maxLength: 120 }), description: t.String({ maxLength: 2000 }), category: t.String({ minLength: 2, maxLength: 80 }), mediaType: t.Union([t.Literal("IMAGE"), t.Literal("VIDEO")]), mediaPath: t.String({ maxLength: 300 }), orientation: t.Union([t.Literal("PORTRAIT"), t.Literal("LANDSCAPE")]), published: t.Boolean() }) })
      .patch("/gallery/:id", async ({ headers, params, body }) => {
        await actor(headers, "ADMIN");
        const current = await db.galleryAsset.findUnique({ where: { id: params.id } });
        if (!current) throw notFound("Média introuvable.");
        const mediaType = body.mediaType ?? current.mediaType;
        const mediaPath = body.mediaPath ?? current.mediaPath;
        if (!galleryFilename(mediaPath, mediaType)) throw badRequest("Le chemin du média téléversé est invalide.");
        const updated = await db.galleryAsset.update({ where: { id: params.id }, data: body });
        if (body.mediaPath && body.mediaPath !== current.mediaPath) await removeGalleryFile(current.mediaPath, current.mediaType);
        return updated;
      }, { body: t.Partial(t.Object({ title: t.String({ minLength: 2, maxLength: 120 }), description: t.String({ maxLength: 2000 }), category: t.String({ minLength: 2, maxLength: 80 }), mediaType: t.Union([t.Literal("IMAGE"), t.Literal("VIDEO")]), mediaPath: t.String({ maxLength: 300 }), orientation: t.Union([t.Literal("PORTRAIT"), t.Literal("LANDSCAPE")]), published: t.Boolean() })) })
      .delete("/gallery/:id", async ({ headers, params, set }) => {
        await actor(headers, "ADMIN");
        const asset = await db.galleryAsset.findUnique({ where: { id: params.id } });
        if (!asset) throw notFound("Média introuvable.");
        await db.galleryAsset.delete({ where: { id: params.id } });
        await removeGalleryFile(asset.mediaPath, asset.mediaType);
        set.status = 204; return null;
      })
      .get("/orders", async ({ headers, query }) => {
        await actor(headers, "ADMIN");
        return db.productOrder.findMany({ where: query.status ? { status: query.status as "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED" } : undefined, orderBy: { createdAt: "desc" }, take: 200 });
      }, { query: t.Object({ status: t.Optional(t.Union([t.Literal("NEW"), t.Literal("CONFIRMED"), t.Literal("DELIVERED"), t.Literal("CANCELLED")])) }) })
      .patch("/orders/:id", async ({ headers, params, body }) => {
        await actor(headers, "ADMIN");
        return commerceService.changeOrderStatus(params.id, body.status);
      }, { body: t.Object({ status: t.Union([t.Literal("NEW"), t.Literal("CONFIRMED"), t.Literal("DELIVERED"), t.Literal("CANCELLED")]) }) })
      .get("/conversations", async ({ headers }) => {
        await actor(headers, "ADMIN");
        return db.chatConversation.findMany({ include: { user: { select: { name: true, email: true } }, messages: { orderBy: { createdAt: "asc" }, take: 100 } }, orderBy: { updatedAt: "desc" }, take: 100 });
      })
      .post("/conversations/:id/messages", async ({ headers, params, body }) => {
        const adminUser = await actor(headers, "ADMIN");
        if (!await db.chatConversation.findUnique({ where: { id: params.id }, select: { id: true } })) throw notFound("Conversation introuvable.");
        const message = await db.chatMessage.create({ data: { conversationId: params.id, sender: adminUser.id, senderRole: "ADMIN", text: body.text.trim() } });
        await db.chatConversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
        return message;
      }, { body: t.Object({ text: t.String({ minLength: 1, maxLength: 4000 }) }) })
      .get("/suggestions", async ({ headers }) => { await actor(headers, "ADMIN"); return db.suggestion.findMany({ include: { _count: { select: { votes: true } } }, orderBy: { createdAt: "desc" } }); })
      .delete("/suggestions/:id", async ({ headers, params, set }) => {
        await actor(headers, "ADMIN");
        const deleted = await db.suggestion.deleteMany({ where: { id: params.id } });
        if (!deleted.count) throw notFound("Suggestion introuvable.");
        set.status = 204; return null;
      })
    )
  );
