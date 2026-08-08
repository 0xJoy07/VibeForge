"use client";

import { Menu, Star, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Scanner", href: "/scanner" },
    { label: "Editor", href: "/editor" },
    { label: "CLI", href: "/#cli" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-[56px] shrink-0 border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-white text-black">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span className="font-semibold text-[15px] tracking-[-0.01em] text-white">VibeForge</span>
        </Link>
        
        {/* Center */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.href.startsWith('/#') ? false : pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-[6px] px-[10px] py-[6px] text-[13.5px] tracking-[-0.01em] transition duration-150 ${
                  isActive
                    ? "bg-white/[0.05] text-white"
                    : "text-white/[0.55] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          <a href="https://github.com/vibeforge/vibeforge" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-[6px] border border-white/[0.08] px-[10px] py-[6px] text-[13.5px] text-white/[0.55] hover:text-white hover:bg-white/[0.05] transition duration-150">
            <Star className="h-3.5 w-3.5" />
            <span className="tracking-[-0.01em]">Star</span>
          </a>
          
          <div className="h-[14px] w-[1px] bg-white/[0.08]" />
          
          {isLoading ? (
            <div className="h-[30px] w-[80px] animate-pulse rounded-[6px] bg-white/5" />
          ) : isLoggedIn ? (
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-[6px] bg-white/10 hover:bg-white/20 px-[12px] py-[6px] text-[13.5px] font-semibold tracking-[-0.01em] text-white transition duration-150">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-[6px] px-[10px] py-[6px] text-[13.5px] tracking-[-0.01em] text-white/[0.55] hover:text-white hover:bg-white/[0.05] transition duration-150">
                Login
              </Link>
              <Link href="/login" className="rounded-[6px] bg-[#00c97a] hover:bg-[#00b06b] px-[12px] py-[6px] text-[13.5px] font-semibold tracking-[-0.01em] text-black transition duration-150">
                Get Started
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu */}
        <button className="md:hidden text-white/[0.55] hover:text-white transition duration-150 p-1">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
