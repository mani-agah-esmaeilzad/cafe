import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { imageUrlSchema } from "@/lib/validators";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است."),
  description: z.string().optional(),
  imageUrl: imageUrlSchema,
});

export async function GET() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const normalizedImageUrl =
      parsed.data.imageUrl && parsed.data.imageUrl.trim() ? parsed.data.imageUrl : undefined;
    const lastCategory = await prisma.menuCategory.findFirst({
      orderBy: [{ sortOrder: "desc" }, { createdAt: "desc" }],
      select: { sortOrder: true },
    });
    const category = await prisma.menuCategory.create({
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        imageUrl: normalizedImageUrl ?? null,
        sortOrder: (lastCategory?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "دسته‌بندی با این نام وجود دارد." }, { status: 409 });
    }
    return NextResponse.json({ error: "ثبت دسته‌بندی ناموفق بود." }, { status: 500 });
  }
}
