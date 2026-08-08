"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Zap, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BackNav } from "@/components/BackNav";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.Razorpay !== "undefined") {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Tier card component ───────────────────────────────────────────────────────

interface Feature { name: string; included: boolean }
interface TierCardProps {
  name: string;
  price: string;
  description: string;
  features: Feature[];
  cta: React.ReactNode;
  badge?: string;
  featured?: boolean;
  dim?: boolean;
}

function TierCard({ name, price, description, features, cta, badge, featured, dim }: TierCardProps) {
  return (
    <div className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300
      ${featured
        ? "border-[#00c97a]/40 bg-[#00c97a]/[0.04] shadow-[0_0_60px_rgba(0,201,122,0.08)]"
        : "border-white/[0.08] bg-white/[0.02]"}
      ${dim ? "opacity-50 pointer-events-none" : "hover:border-white/20"}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00c97a] px-4 py-1 text-xs font-bold uppercase tracking-widest text-black">
          Most popular
        </div>
      )}
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-zinc-900 px-4 py-1 text-xs font-medium text-zinc-400">
          {badge}
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">{name}</p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-black tracking-tight text-white">{price}</span>
          {price !== "₹0" && <span className="text-sm text-zinc-500">/mo</span>}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f.name} className="flex items-start gap-3 text-sm">
            {f.included
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00c97a]" />
              : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />}
            <span className={f.included ? "text-zinc-200" : "text-zinc-600"}>{f.name}</span>
          </li>
        ))}
      </ul>

      {cta}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCheckingStatus(false); return; }
      setIsLoggedIn(true);
      setUser(user);
      try {
        const res = await fetch("/api/payments/status");
        if (res.ok) {
          const data = await res.json() as { subscribed: boolean };
          setIsPro(data.subscribed);
        }
      } catch { /* ignore */ }
      setCheckingStatus(false);
    }
    init();
  }, []);

  async function handleSubscribe() {
    if (!isLoggedIn) { router.push("/login?next=/pricing"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-subscription", { method: "POST" });
      const data = await res.json() as { subscriptionId?: string; keyId?: string; error?: string };
      if (!res.ok || !data.subscriptionId) { alert(data.error ?? "Failed to create subscription."); return; }

      const loaded = await loadRazorpayScript();
      if (!loaded) { alert("Failed to load payment gateway."); return; }

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "VibeForge",
        description: "Pro Monthly Subscription",
        image: "/favicon.ico",
        theme: { color: "#16a34a" },
        prefill: { email: user?.email, name: user?.user_metadata?.name },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function(response: any) { 
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          if (verifyRes.ok) {
            window.location.href = '/dashboard?subscribed=true'; 
          } else {
            alert("Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        modal: { ondismiss: function() { setLoading(false); } }
      });
      rzp.open();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const ProCTA = isPro ? (
    <Link
      href="/billing"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00c97a]/40 px-6 py-3 text-sm font-semibold text-[#00c97a] transition-colors hover:bg-[#00c97a]/10"
    >
      Manage subscription
    </Link>
  ) : (
    <button
      onClick={handleSubscribe}
      disabled={loading || checkingStatus}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00c97a] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00b06b] disabled:opacity-70"
    >
      {loading
        ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
        : <><Zap className="h-4 w-4" /> Subscribe to Pro</>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-[#00c97a]/[0.06] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />

      {/* Test-mode banner */}
      <div className="relative z-50 w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-xs font-medium text-amber-300">
        🧪 Test mode — use card <span className="font-mono font-bold">5267 3181 8797 5449</span>, expiry <span className="font-mono font-bold">12/29</span>, CVV <span className="font-mono font-bold">123</span>, OTP <span className="font-mono font-bold">1234</span>
      </div>

      {/* Navbar */}
      <div className="relative z-40 bg-black">
        <BackNav toDashboard={false} />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-24">
        {/* Hero */}
        <div className="mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300">
            <Zap className="h-3 w-3 text-[#00c97a]" /> Simple pricing, no surprises
          </div>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
            Choose your <span className="text-[#00c97a]">plan</span>
          </h1>
          <p className="mt-5 text-lg font-light leading-relaxed text-zinc-400">
            From solo hacks to production teams. Upgrade anytime.
          </p>
        </div>

        {/* Tier grid */}
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <TierCard
            name="Free"
            price="₹0"
            description="Perfect for trying out VibeForge on personal projects."
            features={[
              { name: "3 web scans per day", included: true },
              { name: "Code editor access", included: true },
              { name: "Basic issue detection", included: true },
              { name: "CLI tool", included: false },
              { name: "Report exports (HTML/JSON)", included: false },
              { name: "Scan history", included: false },
            ]}
            cta={
              <Link
                href="/scanner"
                className="flex w-full items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Get started free
              </Link>
            }
          />

          <TierCard
            name="Pro"
            price="₹499"
            description="For professional developers shipping production-grade code."
            featured
            features={[
              { name: "Unlimited web scans", included: true },
              { name: "CLI tool access", included: true },
              { name: "HTML + JSON report exports", included: true },
              { name: "Auto-fix in CLI", included: true },
              { name: "Full scan history", included: true },
              { name: "Priority support", included: true },
            ]}
            cta={ProCTA}
          />

          <TierCard
            name="Team"
            price="₹1499"
            description="Everything your team needs with shared dashboards and seats."
            badge="Coming soon"
            dim
            features={[
              { name: "Everything in Pro", included: true },
              { name: "5 seats included", included: true },
              { name: "Team dashboard", included: true },
              { name: "Shared scan history", included: true },
              { name: "Role-based access", included: true },
              { name: "Priority support", included: true },
            ]}
            cta={
              <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-600">
                <Users className="h-4 w-4" /> Coming soon
              </button>
            }
          />
        </div>

        {/* FAQ */}
        <div className="mt-32 w-full max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "What happens when I exceed my free daily scans?", a: "Your quota resets at midnight UTC each day. Upgrade to Pro for unlimited scans." },
              { q: "Can I cancel my Pro subscription anytime?", a: "Yes. Cancel from your billing page — you keep Pro access until the end of your billing period." },
              { q: "Is this safe to use on private repos?", a: "We only read public GitHub repos. Your code is never stored on our servers." },
              { q: "Do you offer discounts for open-source projects?", a: "Yes! Contact us with a link to your repo for a free Pro license." },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
