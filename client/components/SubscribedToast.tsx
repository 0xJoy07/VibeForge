"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function SubscribedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      setShow(true);
      // Clean up the URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("subscribed");
      const newUrl = newSearchParams.toString() ? `${pathname}?${newSearchParams.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });

      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname, router]);

  if (!show) return null;

  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
      <CheckCircle2 className="w-5 h-5 text-green-500" />
      <span className="font-medium">Welcome to Pro! Your CLI access is now active.</span>
    </div>
  );
}
