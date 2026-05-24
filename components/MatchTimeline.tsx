"use client";

import { Crown, Flag, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { MatchResult, RewardResponse } from "@/lib/types";

export function MatchTimeline({
  match,
  reward,
  activeStage,
}: {
  match: MatchResult;
  reward?: RewardResponse;
  activeStage: number;
}) {
  const winner = match.winner;
  const items = [
    {
      icon: Flag,
      label: "Final rush",
      detail: `${match.players.length} players crossed the arena gate`,
      done: true,
    },
    {
      icon: Crown,
      label: "Crown locked",
      detail: winner ? `${winner.displayName} held for ${winner.crownHoldSeconds}s` : "No winner detected",
      done: true,
    },
    {
      icon: ShieldCheck,
      label: "Policy check",
      detail: reward?.policyDecision.reason || "Waiting for agent review",
      done: activeStage >= 2,
    },
    {
      icon: Sparkles,
      label: "Reward pulse",
      detail: reward?.success ? `${reward.rewardAmountHbar} HBAR approved` : "HBAR payout pending",
      done: Boolean(reward?.success),
    },
    {
      icon: RadioTower,
      label: "HCS receipt",
      detail: reward?.hcsTopicId || "Receipt will publish after payout",
      done: Boolean(reward?.hcsMessageTxId),
    },
  ];

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Match Timeline</div>
          <h2 className="mt-2 text-2xl font-black text-white">From arena to receipt</h2>
        </div>
        <div className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white/64 ring-1 ring-white/12">
          {match.matchId}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-3 rounded-md bg-white/7 p-3 ring-1 ring-white/10"
            >
              {index < items.length - 1 && <div className="absolute bottom-[-14px] left-[31px] top-12 w-px bg-white/12" />}
              <div
                className={`relative z-10 grid h-10 w-10 flex-none place-items-center rounded-md ${
                  item.done ? "bg-accent/18 text-accent shadow-[0_0_30px_rgba(48,232,216,0.18)]" : "bg-white/8 text-white/42"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white">{item.label}</div>
                <div className="mt-0.5 truncate text-sm text-white/58">{item.detail}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
