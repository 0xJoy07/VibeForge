"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/login");
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to logout:", errData);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/90 w-full disabled:opacity-50"
        style={{ paddingLeft: '10px' }}
      >
        <div className="flex items-center gap-2.5">
          {isLoading ? (
            <Loader2 className="w-[16px] h-[16px] animate-spin text-muted-foreground/70 group-hover:text-foreground/70" strokeWidth={1.5} />
          ) : (
            <LogOut className="w-[16px] h-[16px] transition-colors text-muted-foreground/70 group-hover:text-foreground/70" strokeWidth={1.5} />
          )}
          <span className="text-[13px] tracking-wide truncate">
            Sign out
          </span>
        </div>
      </button>
    </div>
  );
}
