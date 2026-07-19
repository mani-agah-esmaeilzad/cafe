import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).min(1),
});

export async function PATCH(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const categoryIds = parsed.data.categoryIds;
  const uniqueCategoryIds = new Set(categoryIds);

  if (uniqueCategoryIds.size !== categoryIds.length) {
    return NextResponse.json({ error: "شناسه دسته‌بندی تکراری است." }, { status: 400 });
  }

  const existingCategories = await prisma.menuCategory.findMany({
    select: { id: true },
  });
  const existingCategoryIds = new Set(existingCategories.map((category) => category.id));
  const includesAllCategories =
    categoryIds.length === existingCategoryIds.size && categoryIds.every((id) => existingCategoryIds.has(id));

  if (!includesAllCategories) {
    return NextResponse.json({ error: "لیست دسته‌بندی‌ها کامل یا معتبر نیست." }, { status: 400 });
  }

  await prisma.$transaction(
    categoryIds.map((id, index) =>
      prisma.menuCategory.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
