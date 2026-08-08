"use client";

import { 
  ArrowRight, GitBranch, ScanSearch, Terminal, Star, 
  Menu, Copy, Activity, Layers, Code, CheckCircle2, X 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Velaris from "@/components/ui/velaris";
import PricingCard from "@/components/PricingCard";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const router = useRouter();

  function scan(repo = repoUrl) {
    if (!repo.trim()) {
      router.push("/scanner");
      return;
    }
    router.push(`/scanner?repo=${encodeURIComponent(repo.trim())}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-sans relative">
      
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center w-full relative">
        {/* Animated grid CSS overlay */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <Velaris height="calc(100vh - 56px)" className="w-full relative z-10">
          {/* Subtle dark radial gradient behind the content to make text pop against bright green */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4)_0%,transparent_65%)] pointer-events-none z-0" />
          
          <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-6 text-center relative z-10">
            
            <div className="animate-fade-in-up mt-16">
              <Link href="/download" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 hover:bg-black/60 px-5 py-2 text-sm font-medium text-white backdrop-blur-xl transition-colors shadow-2xl">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Now with CLI support <ArrowRight className="h-4 w-4 ml-1 text-emerald-400" />
              </Link>
            </div>

            <h1 className="max-w-5xl text-5xl font-bold font-serif tracking-tight text-white sm:text-7xl lg:text-[5.5rem] leading-[1.1] drop-shadow-xl animate-[fadeInUp_0.6s_ease_forwards] opacity-0" style={{ animationDelay: '100ms' }}>
              Analyze your repo. <br className="hidden sm:block" />
              <span className="text-emerald-400 font-serif italic drop-shadow-md">
                Elevate your code.
              </span>
            </h1>
            
            <p className="max-w-2xl text-lg text-zinc-300 sm:text-xl font-light tracking-wide backdrop-blur-sm drop-shadow-md animate-[fadeInUp_0.6s_ease_forwards] opacity-0" style={{ animationDelay: '200ms' }}>
              Connect your Git repository and let AI instantly review your codebase for vulnerabilities, performance, and architecture best practices.
            </p>
            
            <div className="mt-8 flex w-full max-w-xl flex-col gap-4 sm:flex-row backdrop-blur-sm animate-[fadeInUp_0.6s_ease_forwards] opacity-0" style={{ animationDelay: '300ms' }}>
              <div className="relative flex-1 group">
                <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && scan()}
                  placeholder="https://github.com/owner/repo" 
                  className="w-full h-[56px] rounded-[12px] border border-white/15 bg-black/60 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-[#00c97a] focus:outline-none focus:ring-1 focus:ring-[#00c97a] backdrop-blur-xl transition-all shadow-2xl"
                />
              </div>
              <button onClick={() => scan()} className="flex h-[56px] items-center justify-center gap-2 rounded-[12px] bg-[#00c97a] px-8 font-bold text-black transition-all hover:bg-[#00b06b] active:scale-95 shadow-2xl shrink-0">
                Scan Now <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Social proof micro-stats */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-zinc-400 backdrop-blur-sm">
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-zinc-500"/> 10k+ repos scanned</div>
              <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-zinc-500"/> 5 issue categories</div>
              <div className="flex items-center gap-2"><Code className="h-4 w-4 text-zinc-500"/> Open source CLI</div>
            </div>
          </div>
        </Velaris>

        {/* How it works */}
        <section id="features" className="w-full py-24 bg-zinc-950 flex flex-col items-center px-6 border-t border-white/5">
          <div className="max-w-6xl w-full">
            <div className="mb-16 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white tracking-tight">
                How it <span className="text-emerald-400 italic font-serif">works</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connectors for desktop */}
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[1px] bg-white/10 z-0"></div>
              
              <div className="flex flex-col items-center text-center gap-4 relative z-10 p-6 rounded-2xl border border-transparent hover:border-emerald-500/20 bg-zinc-950 hover:bg-zinc-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(22,163,74,0.15)]">
                <div className="h-16 w-16 rounded-full bg-black border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl mb-2">01</div>
                <h3 className="text-xl font-bold text-white font-serif">Paste your GitHub URL</h3>
                <p className="text-zinc-400 leading-relaxed">Drop any public repo link into the scanner. No setup, no config.</p>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 relative z-10 p-6 rounded-2xl border border-transparent hover:border-emerald-500/20 bg-zinc-950 hover:bg-zinc-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(22,163,74,0.15)]">
                <div className="h-16 w-16 rounded-full bg-black border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl mb-2">02</div>
                <h3 className="text-xl font-bold text-white font-serif">AI scans your codebase</h3>
                <p className="text-zinc-400 leading-relaxed">Claude reads up to 30 files and flags security issues, AI slop, dead code, and performance problems.</p>
              </div>
              
              <div className="flex flex-col items-center text-center gap-4 relative z-10 p-6 rounded-2xl border border-transparent hover:border-emerald-500/20 bg-zinc-950 hover:bg-zinc-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(22,163,74,0.15)]">
                <div className="h-16 w-16 rounded-full bg-black border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl mb-2">03</div>
                <h3 className="text-xl font-bold text-white font-serif">Get your score + fixes</h3>
                <p className="text-zinc-400 leading-relaxed">See a letter grade, axis breakdown, and one-click fixes for every flagged issue.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Score breakdown */}
        <section id="scanner" className="w-full py-24 bg-black flex flex-col items-center px-6">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-8">
                Score <span className="text-emerald-400 italic font-serif">breakdown</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                We evaluate your repository across 5 critical dimensions to generate a holistic grade. Understand exactly where your code excels and where it needs immediate attention.
              </p>
              
              <ul className="space-y-4">
                {[
                  { name: "Security", color: "bg-red-500" },
                  { name: "AI slop", color: "bg-amber-500" },
                  { name: "Code quality", color: "bg-blue-500" },
                  { name: "Performance", color: "bg-purple-500" },
                  { name: "Structure", color: "bg-emerald-500" }
                ].map(axis => (
                  <li key={axis.name} className="flex items-center gap-3 text-lg font-medium text-white">
                    <div className={`w-3 h-3 rounded-full ${axis.color}`}></div>
                    {axis.name}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Mock Score Card */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-white">vibe-forge/core</h3>
                  <p className="text-zinc-500">Scanned 2 mins ago</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-5xl font-black font-serif text-emerald-400">B</div>
                  <div className="text-zinc-400 font-medium mt-1">74 / 100</div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 relative z-10">
                {[
                  { name: "Security", score: 61, width: "61%", color: "bg-red-500" },
                  { name: "AI slop", score: 78, width: "78%", color: "bg-amber-500" },
                  { name: "Code quality", score: 82, width: "82%", color: "bg-blue-500" },
                  { name: "Performance", score: 70, width: "70%", color: "bg-purple-500" },
                  { name: "Structure", score: 88, width: "88%", color: "bg-emerald-500" }
                ].map(axis => (
                  <div key={axis.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-300 font-medium">{axis.name}</span>
                      <span className="text-zinc-500">{axis.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className={`h-full ${axis.color} rounded-full`} style={{ width: axis.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex gap-3 mt-4 relative z-10">
                <CheckCircle2 className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-red-400 font-medium text-sm">Hardcoded secrets detected</h4>
                  <p className="text-zinc-400 text-xs mt-1">Found API key in lib/config.ts line 42</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CLI Section */}
        <section id="cli" className="w-full py-24 bg-zinc-950 px-6 border-y border-white/5">
          <div className="max-w-6xl mx-auto rounded-3xl border border-white/10 bg-black overflow-hidden flex flex-col lg:flex-row">
            <div className="p-12 lg:w-1/2 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight mb-4">
                Scan from your <span className="text-emerald-400 italic font-serif">terminal</span>
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Install the CLI and scan any local codebase without leaving your editor. Connects directly to the cloud engine.
              </p>
              
              <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-white/10 p-4 mb-8">
                <code className="text-emerald-400 font-mono text-sm">npx vibeforge scan ./src</code>
                <button className="text-zinc-400 hover:text-white transition-colors" title="Copy to clipboard">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <Link href="/download" className="inline-flex items-center gap-2 text-white font-medium hover:text-emerald-400 transition-colors">
                  View CLI docs <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-6 lg:w-1/2 bg-[#0C0C0C] flex flex-col justify-center">
              <div className="rounded-xl bg-black border border-white/10 font-mono text-sm overflow-hidden">
                <div className="flex gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="p-6 text-zinc-300 leading-loose">
                  <p>$ npx vibeforge scan ./src</p>
                  <p className="text-zinc-500 mt-2">  Scanning 24 files...</p>
                  <p><span className="text-emerald-400">  ✓</span> Security       61/100  <span className="text-red-400">[3 critical]</span></p>
                  <p><span className="text-emerald-400">  ✓</span> AI Slop        78/100  <span className="text-amber-400">[2 warnings]</span></p>
                  <p><span className="text-emerald-400">  ✓</span> Code Quality   82/100</p>
                  <p><span className="text-emerald-400">  ✓</span> Performance    70/100  <span className="text-amber-400">[1 warning]</span></p>
                  <p><span className="text-emerald-400">  ✓</span> Structure      88/100</p>
                  <p className="mt-4">  Overall score: <span className="font-bold text-white">74/100</span>  Grade: <span className="font-bold text-emerald-400">B</span></p>
                  <p className="text-zinc-500">  Run with --report html to export</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section id="pricing" className="w-full py-24 bg-black flex flex-col items-center px-6">
          <div className="max-w-4xl w-full">
            <div className="mb-16 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold font-serif text-white tracking-tight">
                Simple <span className="text-emerald-400 italic font-serif">pricing</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <PricingCard 
                name="Free"
                price="₹0"
                description="Perfect for individual developers and small open-source projects."
                features={[
                  { name: "3 web scans per day", included: true },
                  { name: "Basic editor integration", included: true },
                  { name: "No CLI access", included: false },
                  { name: "No scan history", included: false }
                ]}
                cta="Start for free"
                ctaHref="/scanner"
              />
              <PricingCard 
                name="Pro"
                price="₹499"
                description="For professional developers building production applications."
                features={[
                  { name: "Unlimited scans", included: true },
                  { name: "Full CLI access", included: true },
                  { name: "Report exports", included: true },
                  { name: "Full scan history", included: true }
                ]}
                cta="Get Pro →"
                ctaHref="/pricing"
                featured={true}
              />
            </div>
            
            <div className="text-center">
              <Link href="/pricing" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                See full pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full bg-emerald-950 border-y border-emerald-900 py-32 px-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="max-w-4xl relative z-10">
            <h2 className="text-4xl sm:text-6xl font-bold font-serif text-white tracking-tight mb-6 leading-tight">
              Your codebase has issues. <br/>
              <span className="text-emerald-400 italic font-serif">Find them before your users do.</span>
            </h2>
            <p className="text-xl text-emerald-100/70 mb-10 max-w-2xl mx-auto">
              Join thousands of developers shipping better, more secure software with VibeForge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/scanner" className="rounded-[6px] bg-[#00c97a] hover:bg-[#00b06b] px-8 py-4 font-bold text-black transition-colors">
                Scan a repo
              </Link>
              <Link href="/download" className="rounded-[6px] bg-white/10 hover:bg-white/20 px-8 py-4 font-bold text-white transition-colors">
                Install CLI
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black pt-24 pb-8 flex flex-col items-center overflow-hidden border-t border-white/10">
        <div className="max-w-7xl w-full px-6 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-24">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-white text-black">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="font-semibold text-[15px] tracking-[-0.01em] text-white">VibeForge</span>
              </div>
              <p className="text-zinc-500 text-sm">
                AI-powered codebase analysis and resolution engine.
              </p>
              <div className="mt-2">
                <a href="https://github.com/vibeforge/vibeforge" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path></svg>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Product</h4>
              <Link href="#scanner" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Scanner</Link>
              <Link href="#editor" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Code Editor</Link>
              <Link href="#cli" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">CLI Tool</Link>
              <Link href="/pricing" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Pricing</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Developers</h4>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Documentation</Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">GitHub</Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">npm package</Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Changelog</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-white mb-2">Company</h4>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">About</Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Contact</Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Terms of Service</Link>
              <Link href="#" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            </div>
          </div>
          
          {/* Watermark */}
          <div className="w-full flex justify-center items-center select-none pointer-events-none mb-12">
            <h2 className="text-[12vw] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-black uppercase leading-none whitespace-nowrap">
                VIBEFORGE
            </h2>
          </div>
          
          <div className="w-full border-t border-zinc-900 pt-8 text-center text-sm text-zinc-600">
              <p>© {new Date().getFullYear()} VibeForge Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
