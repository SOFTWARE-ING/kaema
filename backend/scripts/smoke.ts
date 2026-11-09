import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = process.env.API_URL ?? "http://127.0.0.1:3001";
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis.");

const checks: string[] = [];
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Échec du smoke test : ${message}`);
}

async function call(path: string, options: RequestInit = {}, token?: string, cookie?: string) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (cookie) headers.set("Cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({})) as Record<string, any>;
  return { response, body };
}

const adminLogin = await call("/api/auth/login", { method: "POST", body: JSON.stringify({ email: adminEmail, password: adminPassword }) });
assert(adminLogin.response.ok && adminLogin.body?.user?.role === "ADMIN", "connexion administrateur");
const adminToken = adminLogin.body.accessToken as string;
const refreshCookie = adminLogin.response.headers.get("set-cookie")?.split(";")[0];
assert(refreshCookie?.startsWith("kaema_refresh="), "cookie HttpOnly de renouvellement");
checks.push("auth admin et cookie HttpOnly");

const dashboard = await call("/api/admin/dashboard", {}, adminToken);
assert(dashboard.response.ok && typeof dashboard.body?.products === "number", "route admin protégée");
const denied = await call("/api/admin/dashboard");
assert(denied.response.status === 401, "route admin refuse les visiteurs");
checks.push("contrôle d’accès admin");

const galleryImageForm = new FormData();
galleryImageForm.append("file", new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pV8AAAAASUVORK5CYII=", "base64")], { type: "image/png" }), "gallery.png");
const deniedGalleryUpload = await call("/api/admin/uploads/gallery", { method: "POST", body: galleryImageForm });
assert(deniedGalleryUpload.response.status === 401, "upload galerie réservé à l'administrateur");
const galleryImageUpload = await call("/api/admin/uploads/gallery", { method: "POST", body: galleryImageForm }, adminToken);
assert(galleryImageUpload.response.ok && galleryImageUpload.body.mediaType === "IMAGE", "upload d'image dans la galerie");
const galleryImage = await call("/api/admin/gallery", { method: "POST", body: JSON.stringify({ title: "Photo test", description: "Image smoke", category: "Mobilier", mediaType: "IMAGE", mediaPath: galleryImageUpload.body.mediaPath, orientation: "PORTRAIT", published: true }) }, adminToken);
assert(galleryImage.response.ok && galleryImage.body.viewCount === 0 && galleryImage.body.orderCount === 0, "création de l'image avec compteurs");
const imageView = await call(`/api/gallery/${galleryImage.body.id}/view`, { method: "POST" });
const imageOrder = await call(`/api/gallery/${galleryImage.body.id}/order`, { method: "POST" });
assert(imageView.body.viewCount === 1 && imageOrder.body.orderCount === 1, "comptage des vues et commandes image");
const editedImage = await call(`/api/admin/gallery/${galleryImage.body.id}`, { method: "PATCH", body: JSON.stringify({ title: "Photo modifiée", published: false }) }, adminToken);
assert(editedImage.response.ok && editedImage.body.title === "Photo modifiée" && !editedImage.body.published, "modification et dépublication d'une image");
const hiddenGallery = await call("/api/gallery");
assert(!hiddenGallery.body.some((item: { id: string }) => item.id === galleryImage.body.id), "média masqué absent de la galerie publique");
const removeImage = await call(`/api/admin/gallery/${galleryImage.body.id}`, { method: "DELETE" }, adminToken);
assert(removeImage.response.status === 204, "suppression d'image galerie");

if (spawnSync(process.env.FFMPEG_PATH ?? "ffmpeg", ["-version"], { stdio: "ignore" }).status === 0) {
  const videoFixtureDirectory = await mkdtemp(join(tmpdir(), "kaema-gallery-smoke-"));
  try {
  const aviFixture = join(videoFixtureDirectory, "gallery.avi");
  execFileSync(process.env.FFMPEG_PATH ?? "ffmpeg", ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=black:s=128x96:r=12:d=1", "-an", "-c:v", "mpeg4", "-vtag", "XVID", "-y", aviFixture], { stdio: "ignore" });
  const galleryVideoForm = new FormData();
  galleryVideoForm.append("file", new Blob([await readFile(aviFixture)], { type: "video/x-msvideo" }), "gallery.avi");
  const galleryVideoUpload = await call("/api/admin/uploads/gallery", { method: "POST", body: galleryVideoForm }, adminToken);
  assert(galleryVideoUpload.response.ok && galleryVideoUpload.body.mediaType === "VIDEO" && galleryVideoUpload.body.mediaPath.endsWith(".mp4"), "upload AVI converti en MP4 lisible");
  const galleryVideo = await call("/api/admin/gallery", { method: "POST", body: JSON.stringify({ title: "Vidéo test", description: "Test de lecture vidéo", category: "Projet", mediaType: "VIDEO", mediaPath: galleryVideoUpload.body.mediaPath, orientation: "LANDSCAPE", published: true }) }, adminToken);
  assert(galleryVideo.response.ok, "création vidéo galerie");
  const videoRange = await fetch(`${baseUrl}${galleryVideoUpload.body.mediaPath}`, { headers: { Range: "bytes=0-7" } });
  assert(videoRange.status === 206 && videoRange.headers.get("content-range")?.startsWith("bytes 0-7/"), "lecture vidéo par segments HTTP Range");
  const videoView = await call(`/api/gallery/${galleryVideo.body.id}/view`, { method: "POST" });
  const videoOrder = await call(`/api/gallery/${galleryVideo.body.id}/order`, { method: "POST" });
  assert(videoView.body.viewCount === 1 && videoOrder.body.orderCount === 1, "comptage des vues et commandes vidéo");
  const portraitVideo = await call(`/api/admin/gallery/${galleryVideo.body.id}`, { method: "PATCH", body: JSON.stringify({ orientation: "PORTRAIT" }) }, adminToken);
  assert(portraitVideo.response.ok && portraitVideo.body.orientation === "PORTRAIT", "orientation vidéo modifiable en portrait ou paysage");
  const removeVideo = await call(`/api/admin/gallery/${galleryVideo.body.id}`, { method: "DELETE" }, adminToken);
  assert(removeVideo.response.status === 204, "suppression de vidéo et de son fichier");
  } finally {
    await rm(videoFixtureDirectory, { recursive: true, force: true });
  }
  checks.push("conversion AVI vers MP4, streaming Range et métriques vidéo");
} else {
  console.warn("FFmpeg absent : test AVI/MP4 ignoré. Installez FFmpeg pour valider la conversion complète.");
}
checks.push("galerie : CRUD image, compteurs, masquage et protection admin");

const makeImageData = () => {
  const data = new FormData();
  data.append("file", new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pV8AAAAASUVORK5CYII=", "base64")], { type: "image/png" }), "pixel.png");
  return data;
};
const deniedImageUpload = await call("/api/admin/uploads/products", { method: "POST", body: makeImageData() });
assert(deniedImageUpload.response.status === 401, "upload image réservé à l'administrateur");
const imageData = makeImageData();
const imageUpload = await call("/api/admin/uploads/products", { method: "POST", body: imageData }, adminToken);
assert(imageUpload.response.ok && /^\/uploads\/products\/[\da-f-]{36}\.png$/.test(imageUpload.body?.imageUrl), "upload d'image protégé et chemin public renvoyé");
const storedImage = await fetch(`${baseUrl}${imageUpload.body.imageUrl}`);
assert(storedImage.ok && storedImage.headers.get("content-type") === "image/png", "image servie depuis le dossier du backend");
checks.push("upload d'image validé et stockage du chemin");

const productResponse = await call("/api/admin/products", { method: "POST", body: JSON.stringify({ name: "Produit test", description: "Fiche de test de commande", price: 25000, imageUrl: imageUpload.body.imageUrl, stock: 3, published: true }) }, adminToken);
assert(productResponse.response.status === 200 || productResponse.response.status === 201, "création du produit");
const product = productResponse.body;
assert(product.imageUrl === imageUpload.body.imageUrl, "seul le chemin de l'image est conservé sur le produit");
const listedProducts = await call("/api/showroom/products");
assert(listedProducts.response.ok && listedProducts.body.some((item: { id: string }) => item.id === product.id), "publication du produit");

const orderResponse = await call("/api/showroom/orders", { method: "POST", body: JSON.stringify({ productId: product.id, quantity: 2, customerName: "Client Test", customerContact: "+237600000000", message: "Test" }) });
assert(orderResponse.response.ok, "création de la commande");
const order = orderResponse.body;
const reducedProducts = await call("/api/showroom/products");
assert(reducedProducts.body.find((item: { id: string }) => item.id === product.id)?.stock === 1, "stock décrémenté atomiquement");
const confirmed = await call(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ status: "CONFIRMED" }) }, adminToken);
assert(confirmed.response.ok, "confirmation de commande");
const cancelled = await call(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) }, adminToken);
assert(cancelled.response.ok, "annulation de commande");
const duplicateCancel = await call(`/api/admin/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) }, adminToken);
assert(duplicateCancel.response.ok, "annulation répétée idempotente");
const restoredProducts = await call("/api/showroom/products");
assert(restoredProducts.body.find((item: { id: string }) => item.id === product.id)?.stock === 3, "stock restitué une seule fois");
checks.push("showroom, commande transactionnelle et transitions de statut");

const appointmentDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const appointment = await call("/api/appointments", { method: "POST", body: JSON.stringify({ clientName: "Visiteur Test", contact: "test@example.com", service: "Design intérieur", date: appointmentDate, slot: "10:00", message: "Test", channel: "WEBSITE" }) });
assert(appointment.response.ok, "création de rendez-vous publique");
const appointmentList = await call("/api/admin/appointments", {}, adminToken);
assert(appointmentList.response.ok && appointmentList.body.some((item: { id: string }) => item.id === appointment.body.id), "consultation admin des rendez-vous");

const suggestion = await call("/api/suggestions", { method: "POST", body: JSON.stringify({ author: "Test", content: "Idée de test pour KAEMA", category: "Design" }) });
assert(suggestion.response.ok, "création de suggestion");
const guestId = crypto.randomUUID();
const vote = await call(`/api/suggestions/${suggestion.body.id}/vote`, { method: "POST", headers: { "X-Kaema-Guest": guestId } });
assert(vote.response.ok && vote.body.votes === 1, "vote de suggestion");
const duplicateVote = await call(`/api/suggestions/${suggestion.body.id}/vote`, { method: "POST", headers: { "X-Kaema-Guest": guestId } });
assert(duplicateVote.response.status === 409, "vote en double refusé");
checks.push("rendez-vous, suggestions et anti double vote");

const chatGuest = crypto.randomUUID();
const chatMessage = await call("/api/client/chat/messages", { method: "POST", headers: { "X-Kaema-Guest": chatGuest }, body: JSON.stringify({ text: "Bonjour, test du chat." }) });
assert(chatMessage.response.ok, "message visiteur");
const conversations = await call("/api/admin/conversations", {}, adminToken);
const conversation = conversations.body.find((item: { messages: Array<{ id: string }> }) => item.messages.some((message) => message.id === chatMessage.body.id));
assert(conversation, "conversation visible côté admin");
const reply = await call(`/api/admin/conversations/${conversation.id}/messages`, { method: "POST", body: JSON.stringify({ text: "Réponse de test." }) }, adminToken);
assert(reply.response.ok, "réponse admin dans le chat");
const chatRead = await call("/api/client/chat/messages", { headers: { "X-Kaema-Guest": chatGuest } });
assert(chatRead.response.ok && chatRead.body.messages.some((message: { id: string }) => message.id === reply.body.id), "réponse visible côté client");
checks.push("messagerie visiteur avec réponse admin");

const clientEmail = `smoke-${crypto.randomUUID()}@example.com`;
const clientRegister = await call("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Client Test", email: clientEmail, password: "SmokeTest!2026Secure" }) });
assert(clientRegister.response.ok && clientRegister.body?.user?.role === "CLIENT", `inscription client (${clientRegister.response.status}: ${JSON.stringify(clientRegister.body)})`);
const clientToken = clientRegister.body.accessToken as string;
const profile = await call("/api/auth/me", {}, clientToken);
assert(profile.response.ok && profile.body.email === clientEmail, "profil client authentifié");
const ownAppointment = await call("/api/appointments", { method: "POST", body: JSON.stringify({ clientName: "Client Test", contact: clientEmail, service: "Rénovation", date: appointmentDate, slot: "12:00", channel: "CHAT" }) }, clientToken);
assert(ownAppointment.response.ok, "rendez-vous lié au compte");
const ownAppointments = await call("/api/client/appointments", {}, clientToken);
assert(ownAppointments.response.ok && ownAppointments.body.some((item: { id: string }) => item.id === ownAppointment.body.id), "historique client privé");
checks.push("inscription et espace client");

const rotated = await call("/api/auth/refresh", { method: "POST" }, undefined, refreshCookie);
assert(rotated.response.ok && rotated.body.accessToken, "renouvellement de jeton");
const rotatedCookie = rotated.response.headers.get("set-cookie")?.split(";")[0];
assert(rotatedCookie && rotatedCookie !== refreshCookie, "rotation du jeton de renouvellement");
const oldToken = await call("/api/auth/refresh", { method: "POST" }, undefined, refreshCookie);
assert(oldToken.response.status === 401, "ancien jeton révoqué après rotation");
checks.push("rotation et révocation des jetons");

console.log(`Smoke tests réussis (${checks.length}) :\n- ${checks.join("\n- ")}`);
