import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";

export async function DELETE(request: NextRequest, context: any) {
  const { params } = context ?? {};
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categoryIdParam = params?.id;
  const id = Number(categoryIdParam);
  if (!categoryIdParam || Number.isNaN(id)) {
    return NextResponse.json({ error: "شناسه معتبر نیست." }, { status: 400 });
  }

  const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (itemCount > 0) {
    return NextResponse.json(
      { error: "برای حذف این دسته‌بندی ابتدا محصولات مرتبط را حذف یا منتقل کنید." },
      { status: 409 }
    );
  }

  await prisma.menuCategory.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
