import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است."),
  description: z.string().optional(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
});

export async function GET() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { createdAt: "asc" },
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
    const category = await prisma.menuCategory.create({
      data: {
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        imageUrl: parsed.data.imageUrl || null,
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
