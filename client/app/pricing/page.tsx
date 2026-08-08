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

// Eager script load is now inside the component

import PricingCard from "@/components/PricingCard";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAlreadyPro, setIsAlreadyPro] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatusLoaded(true); return; }
      setIsLoggedIn(true);
      setUser(user);
      try {
        const res = await fetch("/api/payments/status");
        if (res.ok) {
          const data = await res.json() as { subscribed: boolean };
          setIsAlreadyPro(data.subscribed);
        }
      } catch { /* ignore */ }
      setStatusLoaded(true);
    }
    init();
  }, []);

  async function handleSubscribe() {
    if (!isLoggedIn) { router.push("/login?next=/pricing"); return; }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/create-subscription", { method: "POST" });
      const data = await res.json() as { orderId?: string; keyId?: string; amount?: number; currency?: string; error?: string };

      if (!res.ok) {
        alert(data.error ?? "Failed to create order.");
        setIsProcessing(false);
        return;
      }

      if (!data.orderId) {
        alert("Failed to create order.");
        setIsProcessing(false);
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        alert("Failed to load payment gateway.");
        setIsProcessing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "VibeForge",
        description: "Pro Plan — Monthly",
        image: "/favicon.ico",
        theme: { color: "#16a34a" },
        prefill: {
          email: user?.email ?? "",
          name: user?.user_metadata?.name ?? "",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: function (response: any) {
          verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
      setIsProcessing(false);
    }
  }

  async function verifyPayment(orderId: string, paymentId: string, signature: string) {
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard?subscribed=true";
      } else {
        alert("Payment verification failed. Contact support.");
        setIsProcessing(false);
      }
    } catch {
      alert("Payment verification error.");
      setIsProcessing(false);
    }
  }

  const ProCTA = (statusLoaded && isAlreadyPro) ? (
    <Link
      href="/billing"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00c97a]/40 px-6 py-3 text-sm font-semibold text-[#00c97a] transition-colors hover:bg-[#00c97a]/10"
    >
      Manage subscription
    </Link>
  ) : (
    <button
      onClick={handleSubscribe}
      disabled={isProcessing}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00c97a] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00b06b] disabled:opacity-70"
    >
      {isProcessing
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
        🧪 Test mode — use card <span className="font-mono font-bold">4111 1111 1111 1111</span>, expiry <span className="font-mono font-bold">12/29</span>, CVV <span className="font-mono font-bold">123</span>
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

        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
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
            cta="Get started free"
            ctaHref="/scanner"
          />

          <PricingCard
            name="Pro"
            price="₹499"
            description="For professional developers shipping production-grade code."
            featured={true}
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

          <PricingCard
            name="Team"
            price="₹1499"
            description="Everything your team needs with shared dashboards and seats."
            badge="Coming soon"
            disabled={true}
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
