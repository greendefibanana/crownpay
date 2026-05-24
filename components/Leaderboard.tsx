"use client";

import { BarChart3 } from "lucide-react";
import type { Receipt } from "@/lib/types";

const fallbackRows = [
  { name: "CherryKing", avatar: "CP", score: 920 },
  { name: "PixelNinja", avatar: "PN", score: 845 },
  { name: "HbarHero", avatar: "HH", score: 710 },
];

export function Leaderboard({ receipts }: { receipts: Receipt[] }) {
  const rows = receipts.length
    ? receipts.slice(0, 3).map((receipt) => ({
        name: receipt.winner.displayName,
        avatar: receipt.winner.displayName.slice(0, 2).toUpperCase(),
        score: receipt.winner.score,
      }))
    : fallbackRows;

  return (
    <section className="clay-card flex min-h-[18rem] flex-col rounded-[2rem] p-6">
      <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold text-[#e7dff5]">
        <BarChart3 className="h-6 w-6 text-[#ffe16d]" aria-hidden="true" />
        Leaderboard
      </h2>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={`${row.name}-${index}`}
            className={`flex items-center gap-3 rounded-[1.3rem] p-3 ring-1 ${
              index === 0 ? "bg-[#373243] ring-[#ffe16d]/35" : "bg-[#1d1928] ring-[#373243]"
            }`}
          >
            <span className={`w-5 font-ticket text-sm font-bold ${index === 0 ? "text-[#ffe16d]" : "text-[#d6c2c4]"}`}>{index + 1}</span>
            <div
              className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold shadow-inner ${
                index === 0 ? "bg-gradient-to-br from-[#ffb7c5] to-[#ffdb3c] text-[#50212d]" : "bg-[#373243] text-[#d6c2c4]"
              }`}
            >
              {row.avatar}
            </div>
            <span className="min-w-0 flex-1 truncate text-lg font-bold text-[#e7dff5]">{row.name}</span>
            <span className={`font-ticket text-sm tabular-nums ${index === 0 ? "rounded-full bg-[#ffe16d]/10 px-2 py-1 text-[#ffe16d]" : "text-[#d6c2c4]"}`}>
              {row.score}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-auto min-h-11 rounded-full border border-[#373243] px-4 py-2 text-sm font-bold text-[#d6c2c4] transition-colors hover:text-[#ffdee3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffcd] focus-visible:ring-offset-4 focus-visible:ring-offset-[#211d2d]"
      >
        View full leaderboard
      </button>
    </section>
  );
}
