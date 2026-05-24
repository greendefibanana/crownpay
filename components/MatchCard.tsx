"use client";

import { Crown, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { MatchResult } from "@/lib/types";

export function MatchCard({ match }: { match: MatchResult }) {
  const winner = match.winner;
  const rewarded = match.status === "Rewarded";

  return (
    <section className="clay-card-raised relative mx-auto flex w-full max-w-md flex-col items-center overflow-hidden rounded-[2.5rem] p-6 text-center lg:min-h-[28rem] lg:p-8">
      <div className="absolute right-[-2rem] top-[-2rem] h-36 w-36 rounded-bl-[7rem] bg-[#ffb7c5]/20" aria-hidden="true" />
      <div className="absolute inset-x-8 bottom-8 h-24 rounded-full bg-[#100c1a]/35 blur-2xl" aria-hidden="true" />

      {rewarded && (
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: -8 }}
          animate={{ scale: [0.9, 1.06, 1], opacity: 1, y: 0 }}
          className="absolute right-5 top-5 z-20 rounded-full bg-[#6fffcd] px-4 py-2 text-sm font-bold text-[#003828] shadow-[0_8px_0_#00513c,0_14px_22px_rgba(0,0,0,0.28)]"
        >
          Reward sent
        </motion.div>
      )}

      <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[#ffdb3c] px-5 py-2 font-ticket text-sm font-bold uppercase tracking-[0.18em] text-[#3a3000] shadow-[inset_0_-4px_0_rgba(84,70,0,0.22)]">
        <Crown className="h-4 w-4" aria-hidden="true" />
        {match.gameMode} Match
      </div>

      <div className="relative z-10 mt-8">
        <div className="winner-pulse relative grid h-32 w-32 place-items-center rounded-full border-4 border-[#ffe16d] bg-[#373243] p-1 shadow-[0_0_24px_rgba(255,225,109,0.34)] lg:h-36 lg:w-36">
          <div className={`grid h-full w-full place-items-center rounded-full bg-gradient-to-br ${winner?.avatarColor || "from-pink-300 to-yellow-300"} text-5xl shadow-inner lg:text-6xl`}>
            {winner?.avatar || "CP"}
          </div>
        </div>
        <div className="absolute -bottom-3 -right-4 grid h-12 w-12 place-items-center rounded-full bg-[#6fffcd] text-lg font-bold text-[#003828] shadow-[0_5px_0_#00513c] ring-2 ring-[#151120]">
          #1
        </div>
      </div>

      <h2 className="relative z-10 mt-8 text-4xl font-bold leading-none text-[#e7dff5] soft-text-shadow">
        {winner?.displayName || "No Winner"}
      </h2>
      <p className="relative z-10 mt-2 text-lg font-medium text-[#d6c2c4]">{rewarded ? "Rewarded winner" : "Winner"}</p>

      <div className="relative z-10 mt-8 grid w-full grid-cols-3 rounded-[1.35rem] bg-[#1d1928] p-4 shadow-inner ring-1 ring-[#373243]">
        <Stat label="Score" value={`${winner?.score || 0}`} tone="text-[#ffe16d]" />
        <Stat label="Hold" value={`${winner?.crownHoldSeconds || 0}s`} tone="border-x border-[#373243] text-[#ffdee3]" />
        <Stat label="Elims" value={`${winner?.eliminations || 0}`} tone="text-[#6fffcd]" />
      </div>

      <div className="relative z-10 mt-5 flex w-full flex-wrap items-center justify-between gap-3 text-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#1d1928] px-4 py-2 font-bold text-[#d6c2c4] ring-1 ring-[#373243]">
          <Trophy className="h-4 w-4 text-[#ffe16d]" aria-hidden="true" />
          {match.arena}
        </div>
        <div className="flex -space-x-2">
          {match.players.slice(0, 4).map((player) => (
            <div
              key={player.id}
              className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${player.avatarColor} text-lg shadow-[0_6px_16px_rgba(0,0,0,0.28)] ring-2 ring-[#151120]`}
              title={player.displayName}
              aria-label={player.displayName}
            >
              {player.avatar}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`flex flex-col items-center px-2 ${tone}`}>
      <span className="font-ticket text-xs uppercase tracking-[0.16em] text-[#d6c2c4]">{label}</span>
      <span className="mt-1 text-2xl font-bold tabular-nums">{value}</span>
    </div>
  );
}
