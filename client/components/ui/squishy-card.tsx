"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";

export interface SquishyCardProps {
  tier: string;
  price: string;
  description: string;
  features: { name: string; included: boolean }[];
  buttonText: string;
  isPopular?: boolean;
  href?: string;
}

export const SquishyCard = ({ tier, price, description, features, buttonText, isPopular, href }: SquishyCardProps) => {
  return (
    <motion.div
      whileHover="hover"
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
      variants={{
        hover: {
          scale: 1.05,
        },
      }}
      className={`relative h-full w-full shrink-0 overflow-hidden rounded-[24px] p-8 flex flex-col ${
        isPopular ? "bg-zinc-900 border border-emerald-500/50" : "bg-zinc-950 border border-white/10"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg z-30">
          POPULAR
        </div>
      )}
      
      {/* Glow for popular card */}
      {isPopular && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full z-0 pointer-events-none"></div>
      )}

      <div className="relative z-10 text-white flex flex-col h-full pointer-events-none">
        <h3 className="text-2xl font-bold font-serif text-white mb-2">{tier}</h3>
        <motion.div
          initial={{ scale: 0.85 }}
          variants={{
            hover: {
              scale: 1,
            },
          }}
          transition={{
            duration: 1,
            ease: "backInOut",
          }}
          className="my-2 block origin-top-left text-4xl font-bold text-white mb-6"
        >
          {price}<span className="text-lg text-zinc-500 font-normal">/mo</span>
        </motion.div>
        
        <p className="text-zinc-400 text-sm mb-6 max-w-[90%]">
          {description}
        </p>

        <ul className="space-y-4 mb-8 flex-1 text-zinc-300 text-sm font-sans">
          {features.map((feature, i) => (
            <li key={i} className={`flex gap-3 items-center ${!feature.included ? 'opacity-50' : ''}`}>
              {feature.included ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <X className="h-5 w-5 shrink-0" />
              )}
              {feature.name}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="relative z-20 mt-auto pt-4 w-full">
        {href ? (
          <Link href={href} className={`block w-full rounded-[12px] py-3 text-center font-bold transition-all ${
            isPopular 
              ? "bg-[#00c97a] hover:bg-[#00b06b] text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95" 
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95"
          }`}>
            {buttonText}
          </Link>
        ) : (
          <button className={`w-full rounded-[12px] py-3 text-center font-bold transition-all ${
            isPopular 
              ? "bg-[#00c97a] hover:bg-[#00b06b] text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95" 
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10 active:scale-95"
          }`}>
            {buttonText}
          </button>
        )}
      </div>
      <Background isPopular={isPopular} />
    </motion.div>
  );
};

const Background = ({ isPopular }: { isPopular?: boolean }) => {
  return (
    <motion.svg
      width="320"
      height="384"
      viewBox="0 0 320 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-80"
      variants={{
        hover: {
          scale: 1.5,
        },
      }}
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
    >
      <motion.circle
        variants={{
          hover: {
            scaleY: 0.5,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="114.5"
        r="101.5"
        fill="#00c97a25"
      />
      <motion.ellipse
        variants={{
          hover: {
            scaleY: 2.25,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="265.5"
        rx="101.5"
        ry="43.5"
        fill="#00c97a25"
      />
    </motion.svg>
  );
};
