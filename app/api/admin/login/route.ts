import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ADMIN_TOKEN_COOKIE, adminCookieOptions, signAdminToken, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر است." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return NextResponse.json({ error: "اطلاعات ورود صحیح نیست." }, { status: 401 });
  }

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "اطلاعات ورود صحیح نیست." }, { status: 401 });
  }

  const token = signAdminToken(admin.id, admin.email);

  const response = NextResponse.json({ success: true, admin: { email: admin.email } });
  response.cookies.set(ADMIN_TOKEN_COOKIE, token, adminCookieOptions);

  return response;
}
