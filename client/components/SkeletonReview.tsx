export default function SkeletonReview() {
  return (
    <div className="space-y-6">
      {/* Score ring skeleton */}
      <div className="flex h-[180px] w-full flex-row items-center gap-6 rounded-xl border border-white/10 bg-[#0b1a11] p-4">
        <div className="h-[150px] w-[150px] shrink-0 rounded-full bg-white/5 animate-pulse" />
        <div className="flex w-full flex-col justify-center space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-[60px] rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-[120px] rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Issue section skeletons */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={`section-${i}`} className="space-y-3">
            <div className="h-8 w-[80px] rounded-lg bg-white/5 animate-pulse" />
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, j) => (
                <div key={`card-${j}`} className="h-[100px] w-full rounded-xl border border-white/10 bg-[#06110b] p-4 flex flex-col justify-center gap-3">
                  <div className="h-3 w-[60%] rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-[90%] rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-[70%] rounded bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
