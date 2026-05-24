"use client";

import { Coins, SlidersHorizontal, Trophy } from "lucide-react";
import type { ElementType } from "react";

export function RewardPolicyCard({ maxRewardHbar, defaultRewardHbar }: { maxRewardHbar: number; defaultRewardHbar: number }) {
  const fill = Math.min(100, Math.round((defaultRewardHbar / Math.max(maxRewardHbar, defaultRewardHbar)) * 100));

  return (
    <section className="clay-card flex min-h-[18rem] flex-col gap-5 rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-[#e7dff5]">
          <SlidersHorizontal className="h-6 w-6 text-[#ffdee3]" aria-hidden="true" />
          Reward Policy
        </h2>
        <div className="relative h-7 w-14 rounded-full bg-[#ffdee3] shadow-inner" aria-label="Policy enabled">
          <div className="absolute right-1 top-1 h-5 w-5 rounded-full bg-[#50212d] shadow-sm" />
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-[#1d1928] p-5 shadow-inner ring-1 ring-[#373243]">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-base font-semibold text-[#d6c2c4]">Base payout</span>
          <span className="font-ticket text-sm text-[#ffe16d]">{defaultRewardHbar} HBAR</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#373243] shadow-inner">
          <div className="h-full rounded-full bg-gradient-to-r from-[#ffdb3c] to-[#ffe16d]" style={{ width: `${fill}%` }} />
        </div>
        <div className="mt-3 font-ticket text-xs uppercase tracking-[0.16em] text-[#d6c2c4]">Max {maxRewardHbar} HBAR</div>
      </div>

      <div className="grid gap-3">
        <PolicyRow icon={Trophy} label="Winner-only rewards" value="Locked" />
        <PolicyRow icon={Coins} label="Bonus pool" value="Active" />
      </div>

      <p className="mt-auto text-sm font-semibold leading-6 text-[#d6c2c4]">
        Tiny payouts, big receipts. CrownPay clamps oversized rewards before any Hedera action runs.
      </p>
    </section>
  );
}

function PolicyRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-[#1d1928] p-4 shadow-inner ring-1 ring-[#373243]">
      <div className="flex items-center gap-3 text-[#d6c2c4]">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="font-semibold">{label}</span>
      </div>
      <span className="font-ticket text-sm text-[#6fffcd]">{value}</span>
    </div>
  );
}
