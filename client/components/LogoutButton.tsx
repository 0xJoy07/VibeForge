"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        router.push("/login");
        router.refresh();
      } else {
        console.error("Failed to logout:", error);
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
        className="group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none text-zinc-400 hover:bg-white/10 hover:text-white w-full disabled:opacity-50"
        style={{ paddingLeft: '10px' }}
      >
        <div className="flex items-center gap-2.5">
          {isLoading ? (
            <Loader2 className="w-[16px] h-[16px] animate-spin text-zinc-500 group-hover:text-white" strokeWidth={1.5} />
          ) : (
            <LogOut className="w-[16px] h-[16px] transition-colors text-zinc-500 group-hover:text-white" strokeWidth={1.5} />
          )}
          <span className="text-[13px] tracking-wide truncate">
            Sign out
          </span>
        </div>
      </button>
    </div>
  );
}
