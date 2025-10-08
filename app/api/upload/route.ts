import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل ارسال نشده است" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "حجم فایل باید کمتر از ۵ مگابایت باشد" }, { status: 413 });
  }

  const fileExtension = file.name.split(".").pop();
  const uniqueName = `menu/${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExtension ?? "jpg"}`;

  const blob = await put(uniqueName, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
