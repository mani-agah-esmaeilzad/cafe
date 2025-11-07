import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const modelName = "gemini-2.5-flash-lite";

const buildMenuContext = (
  menu: {
    name: string;
    description?: string | null;
    items: {
      persianName: string;
      englishName?: string | null;
      description?: string | null;
      options: { label: string; price: number }[];
    }[];
  }[],
) => {
  return menu
    .map((category) => {
      const items = category.items
        .map((item) => {
          const prices = item.options?.length
            ? item.options.map((option) => `${option.label}: ${option.price.toLocaleString("fa-IR")} ریال`)
            : [];
          return `- ${item.persianName}${item.englishName ? ` (${item.englishName})` : ""}${
            prices.length ? ` | ${prices.join(" / ")}` : ""
          }${item.description ? `\n  توضیحات: ${item.description}` : ""}`;
        })
        .join("\n");

      return `دسته ${category.name}${category.description ? `: ${category.description}` : ""}\n${items}`;
    })
    .join("\n\n");
};

type ClientMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "کلید Gemini تنظیم نشده است." }, { status: 500 });
  }

  const body = await request.json().catch(() => null) as { messages?: ClientMessage[] } | null;

  const messages = Array.isArray(body?.messages)
    ? body!.messages
        .map((message) => ({
          role: message?.role === "assistant" ? "assistant" : "user",
          content: typeof message?.content === "string" ? message.content.trim() : "",
        }))
        .filter((message) => message.content.length > 0)
    : [];

  if (!messages.length) {
    return NextResponse.json({ error: "هیچ پیامی ارسال نشده است." }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    return NextResponse.json({ error: "آخرین پیام باید از طرف کاربر باشد." }, { status: 400 });
  }

  const categories = await prisma.menuCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { createdAt: "asc" },
        include: {
          options: {
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });

  if (!categories.length) {
    return NextResponse.json({ error: "منو خالی است." }, { status: 400 });
  }

  const menuContext = buildMenuContext(categories);

  const prompt = `تو نقش باریستای یک کافه ایرانی به نام «کافه ماین» را داری. بر اساس منوی زیر، به پرسش یا درخواست مشتری جواب بده. پیشنهادت را با لحن دوستانه فارسی بده و حتماً نام نوشیدنی‌های پیشنهادی را ذکر کن. اگر لازم بود توضیح بده چرا فکر می‌کنی آن نوشیدنی مناسب است. فقط از اطلاعات منوی زیر استفاده کن و اگر چیزی در منو نیست واضح بگو موجود نیست. گفتگو را ادامه‌دار نگه دار و به آخرین پیام مشتری پاسخ بده.\n\nمنو:\n${menuContext}`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    const historyMessages = messages.slice(0, -1).map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: prompt }] },
        {
          role: "model",
          parts: [{ text: "دریافت شد. فقط با اتکا به این منو به مشتری پاسخ می‌دهم." }],
        },
        ...historyMessages,
      ],
    });

    const result = await chat.sendMessage(lastMessage.content);

    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error("Gemini error", error);
    return NextResponse.json({ error: "پاسخ هوش مصنوعی قابل دریافت نیست." }, { status: 500 });
  }
}
