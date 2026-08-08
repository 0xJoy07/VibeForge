"use client";

export default function ScanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Score card skeleton */}
      <div className="grid gap-[48px] rounded-[16px] border border-white/10 bg-[#0b1a11] p-[32px] lg:grid-cols-[360px_1fr] lg:items-center">
        <div className="relative h-[150px] w-[150px] mx-auto lg:mx-0 rounded-full bg-white/5 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={`score-row-${index}`} className="flex flex-col gap-2">
              <div className="w-16 h-2 rounded bg-white/5 animate-pulse" />
              <div className="w-24 h-1 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Summary skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-white/5 animate-pulse" style={{ animationDelay: '100ms' }} />
        <div className="h-3 w-[80%] rounded bg-white/5 animate-pulse" style={{ animationDelay: '200ms' }} />
        <div className="h-3 w-[60%] rounded bg-white/5 animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Issue section skeletons */}
      <div className="space-y-5">
        {[...Array(3)].map((_, sectionIndex) => (
          <section key={`issue-section-${sectionIndex}`} className="space-y-3">
            <div className="w-24 h-5 bg-white/5 rounded animate-pulse" style={{ animationDelay: `${sectionIndex * 100}ms` }} />
            
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, cardIndex) => (
                <div 
                  key={`issue-card-${sectionIndex}-${cardIndex}`} 
                  className="w-full h-[100px] bg-white/5 rounded-xl animate-pulse p-4 flex flex-col gap-2 justify-center"
                  style={{ animationDelay: `${(sectionIndex * 100) + (cardIndex * 100)}ms` }}
                >
                  <div className="h-2 w-[40%] rounded bg-white/10" />
                  <div className="h-2 w-[70%] rounded bg-white/10" />
                  <div className="h-2 w-[55%] rounded bg-white/10" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
