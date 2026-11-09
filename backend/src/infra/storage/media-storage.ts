import { mkdir, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type MediaArea = "products" | "gallery";

const productDirectory = resolve(process.env.PRODUCT_IMAGE_DIR ?? "./uploads/products");
const galleryDirectory = resolve(process.env.GALLERY_MEDIA_DIR ?? "./uploads/gallery");
const bucketName = process.env.S3_BUCKET?.trim();
const endpoint = process.env.S3_ENDPOINT?.trim();
const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const hasAnyS3Credential = Boolean(bucketName || accessKeyId || secretAccessKey);
if (hasAnyS3Credential && !(bucketName && endpoint && accessKeyId && secretAccessKey)) {
  throw new Error("S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID et S3_SECRET_ACCESS_KEY doivent être définis ensemble.");
}

const s3 = bucketName && endpoint && accessKeyId && secretAccessKey
  ? new Bun.S3Client({ bucket: bucketName, endpoint, accessKeyId, secretAccessKey, region: process.env.S3_REGION ?? "auto", virtualHostedStyle: true })
  : undefined;

function localPath(area: MediaArea, filename: string) {
  return resolve(area === "products" ? productDirectory : galleryDirectory, filename);
}

function localFile(area: MediaArea, filename: string) {
  return Bun.file(localPath(area, filename));
}

function objectKey(area: MediaArea, filename: string) {
  return `${area}/${filename}`;
}

export async function saveMedia(area: MediaArea, filename: string, content: Blob, contentType: string) {
  if (s3) {
    await s3.file(objectKey(area, filename), { type: contentType }).write(content);
    return;
  }
  const path = localPath(area, filename);
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, content);
}

export async function saveMediaFile(area: MediaArea, filename: string, sourcePath: string, contentType: string) {
  if (s3) {
    await s3.file(objectKey(area, filename), { type: contentType }).write(Bun.file(sourcePath));
    return;
  }
  const path = localPath(area, filename);
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, Bun.file(sourcePath));
}

export async function readMedia(area: MediaArea, filename: string, contentType: string, range: string | null) {
  const file = s3 ? s3.file(objectKey(area, filename), { type: contentType }) : localFile(area, filename);
  if (!(await file.exists())) return null;

  const size = s3 ? (await file.stat()).size : file.size;
  const headers = { "Content-Type": contentType, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" };
  if (!range) return new Response(file, { headers });

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || size === 0) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
  const suffixLength = match[1] ? 0 : Number(match[2]);
  const start = match[1] ? Number(match[1]) : Math.max(size - suffixLength, 0);
  const end = match[2] && match[1] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
  }

  return new Response(file.slice(start, end + 1), {
    status: 206,
    headers: { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${size}` },
  });
}

export async function removeMedia(area: MediaArea, filename: string) {
  if (s3) {
    await s3.delete(objectKey(area, filename));
    return;
  }
  await unlink(localPath(area, filename)).catch(() => undefined);
}
