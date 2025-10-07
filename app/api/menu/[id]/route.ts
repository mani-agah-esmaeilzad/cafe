import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z
  .object({
    persianName: z.string().min(1).optional(),
    englishName: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().or(z.literal("")).optional(),
    priceSingle: z.number().int().nonnegative().nullable().optional(),
    priceDouble: z.number().int().nonnegative().nullable().optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.number().int().positive().nullable().optional(),
    categoryName: z.string().min(1).optional(),
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
    priceSingle: raw.priceSingle === "" || raw.priceSingle === null ? null : raw.priceSingle !== undefined ? Number(raw.priceSingle) : undefined,
    priceDouble: raw.priceDouble === "" || raw.priceDouble === null ? null : raw.priceDouble !== undefined ? Number(raw.priceDouble) : undefined,
    categoryId: raw.categoryId === "" || raw.categoryId === null ? null : raw.categoryId !== undefined ? Number(raw.categoryId) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  let categoryId: number | null | undefined = data.categoryId ?? undefined;
  if (!categoryId && data.categoryName) {
    const category = await prisma.menuCategory.upsert({
      where: { name: data.categoryName },
      update: {},
      create: { name: data.categoryName },
    });
    categoryId = category.id;
  }

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: {
      persianName: data.persianName,
      englishName: data.englishName,
      description: data.description,
      imageUrl: data.imageUrl,
      priceSingle: data.priceSingle,
      priceDouble: data.priceDouble,
      isAvailable: data.isAvailable,
      categoryId: categoryId === undefined ? data.categoryId ?? undefined : categoryId,
    },
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
