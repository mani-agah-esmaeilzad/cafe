import { z } from "zod";
import { isValidImageUrl } from "@/lib/images";

export const imageUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => isValidImageUrl(value), {
    message: "آدرس تصویر معتبر نیست.",
  });
