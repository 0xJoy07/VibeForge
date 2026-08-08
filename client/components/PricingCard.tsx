"use client";

import { CheckCircle2, XCircle, Zap, Loader2, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface Feature {
  name: string;
  included: boolean;
}

export interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: Feature[];
  cta: string | React.ReactNode;
  ctaHref?: string;
  onCtaClick?: () => void;
  featured?: boolean;
  disabled?: boolean;
  badge?: string;
  isLoading?: boolean;
}

export default function PricingCard({
  name,
  price,
  period = "/mo",
  description,
  features,
  cta,
  ctaHref,
  onCtaClick,
  featured = false,
  disabled = false,
  badge,
  isLoading = false,
}: PricingCardProps) {
  const baseClasses = "relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300 cursor-pointer hover:border-green-500/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(22,163,74,0.12)] hover:translate-y-[-4px]";
  const featuredClasses = "border-green-500/50 bg-green-500/5 hover:border-green-400 hover:shadow-[0_0_40px_rgba(22,163,74,0.2)]";
  const disabledClasses = "opacity-50 pointer-events-none";

  const cardClasses = `${baseClasses} ${featured ? featuredClasses : ""} ${disabled ? disabledClasses : ""}`;

  return (
    <div className={cardClasses}>
      {featured && (
        <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-medium px-3 py-1 rounded-full shadow-lg">
          Most popular
        </div>
      )}
      
      {badge && !featured && (
        <div className="absolute top-4 right-4 rounded-full border border-white/20 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
          {badge}
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">{name}</p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tight text-white">{price}</span>
          {price !== "₹0" && <span className="text-sm text-zinc-500">{period}</span>}
        </div>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f.name} className="flex items-start gap-3 text-sm">
            {f.included ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
            )}
            <span className={f.included ? "text-zinc-200" : "text-zinc-600"}>{f.name}</span>
          </li>
        ))}
      </ul>

      {typeof cta === 'string' ? (
        ctaHref ? (
          <Link
            href={ctaHref}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-colors ${
              featured
                ? "bg-green-500 text-black hover:bg-green-400"
                : "border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white"
            }`}
          >
            {cta}
          </Link>
        ) : (
          <button
            onClick={onCtaClick}
            disabled={disabled || isLoading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-colors disabled:opacity-70 ${
              featured
                ? "bg-green-500 text-black hover:bg-green-400"
                : "border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white"
            }`}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><Zap className="h-4 w-4" /> {cta}</>
            )}
          </button>
        )
      ) : (
        cta
      )}
    </div>
  );
}
