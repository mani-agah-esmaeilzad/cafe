import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "mine_admin_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined. Please set it in your environment.");
  }
  return secret;
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAdminToken = (adminId: number, email: string) =>
  jwt.sign({ adminId, email }, getJwtSecret(), { expiresIn: TOKEN_MAX_AGE_SECONDS });

export const verifyAdminToken = (token?: string | null) => {
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret()) as { adminId: number; email: string; iat: number; exp: number };
  } catch (error) {
    return null;
  }
};

export const getAdminFromRequest = (req: NextRequest) => {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  return verifyAdminToken(token ?? null);
};

export const getAdminFromCookies = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  return verifyAdminToken(token ?? null);
};

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TOKEN_MAX_AGE_SECONDS,
};
