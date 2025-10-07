"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminMenuManager from "./AdminMenuManager";

const AdminDashboard = ({ adminEmail }: { adminEmail: string }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("خروج ناموفق بود.");
      }
      toast({ title: "خروج موفق", description: "با موفقیت از حساب خود خارج شدید." });
      window.location.reload();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خروج ناموفق بود.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="persian-text text-xl font-semibold text-foreground">پنل مدیریت کافه ماین</h1>
            <p className="text-sm text-muted-foreground" dir="ltr">
              {adminEmail}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "..." : "خروج"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AdminMenuManager />
      </main>
    </div>
  );
};

export default AdminDashboard;
