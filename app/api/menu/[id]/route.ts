import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
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
    imageUrl: z.string().url().or(z.literal("")).optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    categoryName: z.string().min(1).optional(),
    categoryImageUrl: z.string().url().or(z.literal("")).optional(),
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

  let categoryId: number | null | undefined = data.categoryId ?? undefined;
  if (!categoryId && data.categoryName) {
    const category = await prisma.menuCategory.upsert({
      where: { name: data.categoryName },
      update: data.categoryImageUrl ? { imageUrl: data.categoryImageUrl } : {},
      create: { name: data.categoryName, imageUrl: data.categoryImageUrl },
    });
    categoryId = category.id;
  } else if (categoryId && data.categoryImageUrl) {
    await prisma.menuCategory.update({
      where: { id: categoryId },
      data: { imageUrl: data.categoryImageUrl },
    });
  }

  const updatePayload = Object.fromEntries(
    Object.entries({
      persianName: data.persianName,
      englishName: data.englishName,
      description: data.description,
      imageUrl: data.imageUrl,
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
