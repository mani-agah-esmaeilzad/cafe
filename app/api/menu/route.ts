import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { z } from "zod";

const menuItemSchema = z.object({
  persianName: z.string().min(1, "نام فارسی الزامی است."),
  englishName: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  priceSingle: z
    .number()
    .int()
    .nonnegative()
    .optional(),
  priceDouble: z
    .number()
    .int()
    .nonnegative()
    .optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
  categoryName: z.string().min(1).optional(),
});

export async function GET() {
  const menu = await prisma.menuCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({ categories: menu });
}

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = menuItemSchema.safeParse({
    ...raw,
    priceSingle: raw.priceSingle !== undefined && raw.priceSingle !== null && raw.priceSingle !== ""
      ? Number(raw.priceSingle)
      : undefined,
    priceDouble: raw.priceDouble !== undefined && raw.priceDouble !== null && raw.priceDouble !== ""
      ? Number(raw.priceDouble)
      : undefined,
    categoryId: raw.categoryId ? Number(raw.categoryId) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categoryName, categoryId, ...itemData } = parsed.data;

  let resolvedCategoryId = categoryId;

  if (!resolvedCategoryId && categoryName) {
    const category = await prisma.menuCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    resolvedCategoryId = category.id;
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      ...itemData,
      categoryId: resolvedCategoryId,
    },
  });

  return NextResponse.json({ item: menuItem }, { status: 201 });
}
