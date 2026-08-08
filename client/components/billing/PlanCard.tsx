"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

interface PlanCardProps {
  initialIsPro: boolean;
}

export function PlanCard({ initialIsPro }: PlanCardProps) {
  const [isPro, setIsPro] = useState(initialIsPro);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [razorpaySubId, setRazorpaySubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/payments/status");
        if (res.ok) {
          const data = await res.json();
          if (data.subscribed) {
            setIsPro(true);
            setStatus(data.status);
            if (data.currentPeriodEnd) setCurrentPeriodEnd(new Date(data.currentPeriodEnd));
            if (data.razorpaySubId) setRazorpaySubId(data.razorpaySubId);
          } else {
            setIsPro(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sub status", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/payments/cancel", { method: "POST" });
      if (res.ok) {
        setStatus("cancelled");
        setShowCancelConfirm(false);
      }
    } catch (err) {
      console.error("Cancellation failed", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const formattedDate = currentPeriodEnd 
    ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(currentPeriodEnd)
    : '';

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 min-h-[250px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="rounded-xl border border-[#00c97a]/30 bg-[#00c97a]/5 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#00c97a]/20 text-[#00c97a] border border-[#00c97a]/30">
            <Zap className="w-3.5 h-3.5" /> Pro Plan
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Pro Subscription</h3>
        <p className="text-sm text-zinc-400 mb-6">You have full access to all VibeForge features.</p>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-sm text-zinc-400">Status</span>
            <span className="text-sm font-medium text-white capitalize">
              {status === 'cancelled' ? (
                <span className="text-amber-500">Cancels on {formattedDate}</span>
              ) : (
                <span className="text-[#00c97a]">Active</span>
              )}
            </span>
          </div>
          
          {status !== 'cancelled' && currentPeriodEnd && (
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-sm text-zinc-400">Next Billing Date</span>
              <span className="text-sm font-medium text-white">{formattedDate}</span>
            </div>
          )}
          
          {razorpaySubId && (
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              <span className="text-sm text-zinc-400">Subscription ID</span>
              <code className="text-xs font-mono bg-black/50 px-2 py-1 rounded text-zinc-300">
                {razorpaySubId}
              </code>
            </div>
          )}
        </div>

        {status !== 'cancelled' && (
          <div className="mt-6 flex flex-col gap-3">
            {!showCancelConfirm ? (
              <Button 
                variant="outline" 
                onClick={() => setShowCancelConfirm(true)}
                className="w-full sm:w-auto self-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                Cancel subscription
              </Button>
            ) : (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-sm text-zinc-200">
                  Your Pro access continues until <span className="font-semibold text-white">{formattedDate}</span>. Cancel anyway?
                </p>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="destructive" 
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Yes, cancel
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isCancelling}
                  >
                    Keep Pro
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Free Layout
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Free Plan</h3>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-zinc-300 border border-white/20">
          Basic
        </span>
      </div>
      
      <p className="text-sm text-zinc-400 mb-6">You are currently on the free plan with limited daily scans.</p>
      
      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-zinc-500 mt-0.5" />
          <span className="text-sm text-zinc-300">3 scans/day remaining</span>
        </div>
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-zinc-500 mt-0.5" />
          <span className="text-sm text-zinc-300">Basic code analysis</span>
        </div>
        <div className="flex items-start gap-2.5 opacity-50">
          <CheckCircle2 className="w-4 h-4 text-zinc-700 mt-0.5" />
          <span className="text-sm text-zinc-500 line-through">Automated fix generation</span>
        </div>
      </div>
      
      <Link href="/pricing" className="block">
        <Button className="w-full bg-[#00c97a] hover:bg-[#00c97a]/90 text-black font-semibold">
          Upgrade to Pro
        </Button>
      </Link>
    </div>
  );
}
