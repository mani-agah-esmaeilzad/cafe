import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { z } from "zod";

const priceOptionSchema = z.object({
  label: z.string().min(1, "نام گزینه الزامی است."),
  price: z
    .number()
    .int()
    .nonnegative(),
});

const menuItemSchema = z.object({
  persianName: z.string().min(1, "نام فارسی الزامی است."),
  englishName: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
  categoryName: z.string().min(1).optional(),
  categoryImageUrl: z.string().url().or(z.literal("")).optional(),
  priceOptions: z.array(priceOptionSchema).optional(),
});

export async function GET() {
  const menu = await prisma.menuCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          options: {
            orderBy: { id: "asc" },
          },
        },
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
  const normalizedPayload = {
    ...raw,
    categoryId: raw.categoryId ? Number(raw.categoryId) : undefined,
    priceOptions: Array.isArray(raw.priceOptions)
      ? raw.priceOptions
          .map((option: any) => ({
            label: typeof option?.label === "string" ? option.label.trim() : "",
            price:
              option?.price !== undefined && option?.price !== null && option?.price !== ""
                ? Number(option.price)
                : undefined,
          }))
          .filter(
            (option: { label: string; price: number | undefined }) =>
              option.label && typeof option.price === "number" && !Number.isNaN(option.price)
          )
      : undefined,
  };

  const parsed = menuItemSchema.safeParse(normalizedPayload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { categoryName, categoryId, categoryImageUrl, priceOptions, ...itemData } = parsed.data;

  if (!priceOptions || !priceOptions.length) {
    return NextResponse.json({ error: "حداقل یک گزینه قیمت‌گذاری الزامی است." }, { status: 400 });
  }

  let resolvedCategoryId = categoryId;

  if (!resolvedCategoryId && categoryName) {
    const category = await prisma.menuCategory.upsert({
      where: { name: categoryName },
      update: categoryImageUrl ? { imageUrl: categoryImageUrl } : {},
      create: { name: categoryName, imageUrl: categoryImageUrl },
    });
    resolvedCategoryId = category.id;
  } else if (resolvedCategoryId && categoryImageUrl) {
    await prisma.menuCategory.update({
      where: { id: resolvedCategoryId },
      data: { imageUrl: categoryImageUrl },
    });
  }

  const menuItem = await prisma.menuItem.create({
    data: {
      ...itemData,
      categoryId: resolvedCategoryId,
    },
  });

  await prisma.menuItemOption.createMany({
    data: priceOptions.map((option) => ({
      menuItemId: menuItem.id,
      label: option.label,
      price: option.price,
    })),
  });

  const itemWithOptions = await prisma.menuItem.findUnique({
    where: { id: menuItem.id },
    include: { options: { orderBy: { id: "asc" } } },
  });

  return NextResponse.json({ item: itemWithOptions }, { status: 201 });
}
