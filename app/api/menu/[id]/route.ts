import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imageUrlSchema } from "@/lib/validators";
import { z } from "zod";

const priceOptionSchema = z.object({
  label: z.string().min(1),
  price: z.number().int().nonnegative(),
});

const updateSchema = z
  .object({
    persianName: z.string().min(1).optional(),
    englishName: z.string().optional(),
    description: z.string().optional(),
    imageUrl: imageUrlSchema,
    isAvailable: z.boolean().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    categoryName: z.string().min(1).optional(),
    categoryImageUrl: imageUrlSchema,
    priceOptions: z.array(priceOptionSchema).optional(),
  })
  .refine(
    (data) => (data.categoryId && data.categoryName) ? false : true,
    {
      message: "categoryId و categoryName را همزمان ارسال نکنید.",
      path: ["category"],
    },
  );

export async function PUT(request: NextRequest, context: any) {
  const { params } = context;
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "شناسه معتبر نیست." }, { status: 400 });
  }

  const raw = await request.json();
  const parsed = updateSchema.safeParse({
    ...raw,
    categoryId:
      raw.categoryId === "" || raw.categoryId === null
        ? null
        : raw.categoryId !== undefined
        ? Number(raw.categoryId)
        : undefined,
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
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const normalizedImageUrl = data.imageUrl && data.imageUrl.trim() ? data.imageUrl : undefined;
  const normalizedCategoryImageUrl =
    data.categoryImageUrl && data.categoryImageUrl.trim() ? data.categoryImageUrl : undefined;
  let categoryId: number | null | undefined = data.categoryId ?? undefined;
  if (!categoryId && data.categoryName) {
    const category = await prisma.menuCategory.upsert({
      where: { name: data.categoryName },
      update: normalizedCategoryImageUrl ? { imageUrl: normalizedCategoryImageUrl } : {},
      create: { name: data.categoryName, imageUrl: normalizedCategoryImageUrl },
    });
    categoryId = category.id;
  } else if (categoryId && normalizedCategoryImageUrl) {
    await prisma.menuCategory.update({
      where: { id: categoryId },
      data: { imageUrl: normalizedCategoryImageUrl },
    });
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      persianName: data.persianName,
      englishName: data.englishName,
      description: data.description,
      imageUrl: normalizedImageUrl,
      isAvailable: data.isAvailable,
      categoryId: categoryId === undefined ? data.categoryId ?? undefined : categoryId,
    }).filter(([, value]) => value !== undefined)
  );

  await prisma.menuItem.update({
    where: { id },
    data: updatePayload,
  });

  if (data.priceOptions) {
    await prisma.menuItemOption.deleteMany({ where: { menuItemId: id } });
    if (data.priceOptions.length) {
      await prisma.menuItemOption.createMany({
        data: data.priceOptions.map((option) => ({
          menuItemId: id,
          label: option.label,
          price: option.price,
        })),
      });
    }
  }

  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: { options: { orderBy: { id: "asc" } } },
  });

  return NextResponse.json({ item: menuItem });
}

export async function DELETE(request: NextRequest, context: any) {
  const { params } = context;
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "شناسه معتبر نیست." }, { status: 400 });
  }

  await prisma.menuItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
