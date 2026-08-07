"use client";

import { SquishyCard } from "@/components/ui/squishy-card";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-sans relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Simple Navbar */}
      <header className="sticky top-0 z-50 w-full h-[56px] border-b border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-white text-black">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="font-semibold text-[15px] tracking-[-0.01em] text-white">VibeForge</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full relative z-10 px-6 py-24">
        
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-5xl sm:text-7xl font-bold font-serif text-white tracking-tight mb-6">
            Simple <span className="text-emerald-400 italic font-serif">pricing</span>
          </h1>
          <p className="text-xl text-zinc-400 font-light leading-relaxed">
            Choose the plan that fits your workflow. Upgrade anytime as your codebase grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl place-items-center md:place-items-stretch">
          <SquishyCard 
            tier="Free"
            price="₹0"
            description="Perfect for individual developers and small open-source projects."
            features={[
              { name: "3 web scans per day", included: true },
              { name: "Basic editor integration", included: true },
              { name: "Community support", included: true },
              { name: "No CLI access", included: false },
              { name: "No scan history", included: false },
              { name: "No custom rules", included: false }
            ]}
            buttonText="Start for free"
          />
          
          <SquishyCard 
            tier="Pro"
            price="₹49"
            description="For professional developers building production applications."
            features={[
              { name: "Unlimited scans", included: true },
              { name: "Full CLI access", included: true },
              { name: "Report exports", included: true },
              { name: "Full scan history", included: true },
              { name: "Custom lint rules", included: true },
              { name: "Priority email support", included: true }
            ]}
            buttonText="Subscribe to Pro"
            isPopular={true}
          />

          <SquishyCard 
            tier="Enterprise"
            price="Custom"
            description="For large teams with advanced security and compliance needs."
            features={[
              { name: "Everything in Pro", included: true },
              { name: "On-premise deployment", included: true },
              { name: "Custom CI/CD pipelines", included: true },
              { name: "Dedicated account manager", included: true },
              { name: "SAML SSO", included: true },
              { name: "SLA guarantees", included: true }
            ]}
            buttonText="Contact Sales"
          />
        </div>

        <div className="mt-32 max-w-3xl text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-8 text-left mt-12">
            {[
              { q: "What happens if I exceed my daily free scans?", a: "Your account will be temporarily rate-limited until midnight UTC, when your limit resets." },
              { q: "Can I cancel my Pro subscription anytime?", a: "Yes, you can cancel your subscription from your dashboard. You'll continue to have Pro access until the end of your billing cycle." },
              { q: "Do you offer a discount for open-source projects?", a: "Absolutely! We love open-source. Contact us with a link to your repository for a free Pro license." },
            ].map((faq, i) => (
              <div key={i} className="bg-zinc-950 border border-white/10 p-6 rounded-2xl">
                <h3 className="font-bold text-lg text-emerald-400 mb-2">{faq.q}</h3>
                <p className="text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

    </div>
  );
}
