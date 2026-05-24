"use client";

import { Crown, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";

type HeroProps = {
  onGenerate: () => void;
  onReward: () => void;
  rewarding: boolean;
};

export function Hero({ onGenerate, onReward, rewarding }: HeroProps) {
  return (
    <section className="flex flex-col justify-center gap-6 text-center lg:min-h-[28rem] lg:text-left">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-[#2c2837] px-5 py-3 font-ticket text-xs uppercase tracking-[0.18em] text-[#6fffcd] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.07),inset_-2px_-3px_6px_rgba(0,0,0,0.42)] ring-1 ring-[#3b3747] lg:mx-0"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        v2.0 Beta Live
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
        <h1 className="soft-text-shadow mx-auto max-w-[12ch] text-6xl font-bold leading-[0.96] tracking-normal text-[#ffdee3] sm:text-7xl lg:mx-0 lg:text-[4.4rem] xl:text-[5rem]">
          <span className="hidden lg:inline">CrownPay Agent</span>
          <span className="lg:hidden">
            Agent
            <br />
            Dashboard
          </span>
        </h1>
        <p className="mt-6 text-2xl font-bold leading-tight text-[#e7dff5] sm:text-3xl lg:max-w-md lg:text-[2.1rem]">
          AI match rewards, verified on Hedera.
        </p>
        <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-8 text-[#d6c2c4] lg:mx-0">
          The party-game economy engine. Automate payouts, secure leaderboards, and stamp every victory on Hedera.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-2 gap-4 sm:mx-auto sm:max-w-md lg:mx-0"
      >
        <button
          type="button"
          onClick={onGenerate}
          className="clay-button min-h-16 bg-[#ffdee3] px-5 py-4 text-lg font-bold text-[#50212d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffcd] focus-visible:ring-offset-4 focus-visible:ring-offset-[#151120] sm:text-xl"
          style={{ "--button-depth": "#6b3743" } as CSSProperties}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Crown className="h-5 w-5" aria-hidden="true" />
            Generate Match
          </span>
        </button>
        <button
          type="button"
          onClick={onReward}
          disabled={rewarding}
          aria-busy={rewarding}
          className="clay-button min-h-16 bg-[#6fffcd] px-5 py-4 text-lg font-bold text-[#003828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdee3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#151120] sm:text-xl"
          style={{ "--button-depth": "#00513c" } as CSSProperties}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {rewarding ? <Sparkles className="h-5 w-5" aria-hidden="true" /> : <Trophy className="h-5 w-5" aria-hidden="true" />}
            {rewarding ? "Agent Running" : "Reward Podium"}
          </span>
        </button>
      </motion.div>
    </section>
  );
}
