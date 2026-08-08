import { Activity } from "lucide-react";

interface UsageCardProps {
  scanCount: number;
  isPro: boolean;
}

export function UsageCard({ scanCount, isPro }: UsageCardProps) {
  const limit = 3;
  const percentage = isPro ? 0 : Math.min((scanCount / limit) * 100, 100);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white/10 rounded-lg">
          <Activity className="w-5 h-5 text-zinc-300" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-white">Daily Usage</h3>
          <p className="text-xs text-zinc-400">Scans performed today</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-300">
            {isPro ? "Unlimited scans" : `${scanCount} / ${limit} scans used`}
          </span>
          <span className="font-medium text-white">
            {isPro ? "∞" : `${Math.max(limit - scanCount, 0)} left`}
          </span>
        </div>
        
        {!isPro && (
          <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/10">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100 ? "bg-red-500" : "bg-[#00c97a]"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
