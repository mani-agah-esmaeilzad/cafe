import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, adminCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
  return response;
}
