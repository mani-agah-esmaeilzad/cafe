import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  apng: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MIME_ALIAS_TO_CANONICAL: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
  "image/apng": "image/png",
};

const normalizeMimeType = (type?: string, extension?: string) => {
  const normalizedType = type?.split(";")[0]?.trim().toLowerCase();
  const canonicalType = normalizedType ? MIME_ALIAS_TO_CANONICAL[normalizedType] ?? normalizedType : undefined;
  if (canonicalType && ALLOWED_MIME_TYPES.has(canonicalType)) {
    return canonicalType;
  }
  const mapped = extension ? EXTENSION_TO_MIME[extension.toLowerCase()] : undefined;
  return mapped ?? null;
};

const bufferToDataUrl = async (file: File, mimeType: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${mimeType};base64,${base64}`;
};

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل ارسال نشده است" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "حجم فایل باید کمتر از ۵ مگابایت باشد" }, { status: 413 });
  }

  const fileExtension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : undefined;
  const mimeType = normalizeMimeType(file.type, fileExtension);

  if (!mimeType) {
    return NextResponse.json({ error: "فرمت فایل پشتیبانی نمی‌شود." }, { status: 415 });
  }

  const uniqueName = `menu/${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExtension ?? MIME_TO_EXTENSION[mimeType] ?? "jpg"}`;
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  if (hasBlobToken) {
    try {
      const blob = await put(uniqueName, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: mimeType,
      });
      return NextResponse.json({ url: blob.url });
    } catch (error) {
      console.error("Vercel Blob upload failed, falling back to inline data URL", error);
    }
  }

  const dataUrl = await bufferToDataUrl(file, mimeType);
  return NextResponse.json({ url: dataUrl });
}
