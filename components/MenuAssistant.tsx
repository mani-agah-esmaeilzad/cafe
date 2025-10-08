"use client";

import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MenuAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "پاسخ دریافت نشد.");
      }

      const { reply } = (await response.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "مشکل در ارتباط با هوش مصنوعی.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="persian-text text-xl">گفتگو با باریستای هوشمند</CardTitle>
        <p className="text-sm text-muted-foreground persian-text">
          درباره سلیقه‌ات در قهوه بگو تا باریستای هوشمند ماین بهترین پیشنهاد را از منو ارائه بده.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-72 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
          {messages.length === 0 ? (
            <p className="persian-text text-sm text-muted-foreground">گفتگو را شروع کن...</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`persian-text text-sm leading-6 ${message.role === "assistant" ? "text-foreground" : "text-muted-foreground"}`}
              >
                <strong>{message.role === "assistant" ? "باریستا:" : "شما:"}</strong> {message.content}
              </div>
            ))
          )}
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="مثلاً: نوشیدنی شیرین و خنک پیشنهاد بده"
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال پاسخ..." : "ارسال"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MenuAssistant;
