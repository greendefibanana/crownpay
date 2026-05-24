"use client";

import Image from "next/image";
import { Check, Copy, ExternalLink, Share2, Verified } from "lucide-react";
import { useState } from "react";
import type { MatchResult, RewardResponse } from "@/lib/types";

export function ReceiptCard({ reward, match }: { reward?: RewardResponse; match: MatchResult }) {
  const [copied, setCopied] = useState<"json" | "post" | null>(null);
  const receipt = reward?.receipt;
  const receipts = reward?.receipts || [];
  const winner = receipt?.winner || match.winner;
  const podiumMode = receipts.length > 1;
  const rewardAmount = podiumMode ? reward?.rewardAmountHbar || 0 : receipt?.rewardAmountHbar || reward?.rewardAmountHbar || 0.5;
  const txId = receipt?.hcsMessageTxId || receipt?.transferTxId || "0.0.preview@pending";

  async function markCopied(kind: "json" | "post") {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  }

  async function copyReceipt() {
    const payload = receipt || {
      match: match.matchId,
      winner: winner?.displayName,
      rewardAmountHbar: rewardAmount,
      status: "preview",
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    await markCopied("json");
  }

  async function shareResult() {
    const text = podiumMode
      ? `CrownPay Agent rewarded the top 3 ${match.gameMode} players with ${rewardAmount} total HBAR. Receipts stamped on Hedera.`
      : `CrownPay Agent rewarded ${winner?.displayName || "the winner"} with ${rewardAmount} HBAR for ${match.gameMode}. Receipt stamped on Hedera.`;
    await navigator.clipboard.writeText(text);
    await markCopied("post");
  }

  return (
    <section className="clay-card-raised relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden rounded-[2rem] p-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[6rem] bg-[#6fffcd]/10" aria-hidden="true" />

      <div className="receipt-ticket my-3 w-full max-w-sm rotate-1 rounded-sm px-5 py-6 transition-transform duration-150 ease-out hover:rotate-0">
        <div className="truncate text-center font-ticket text-xs uppercase tracking-[0.14em] text-[#373243]/65">
          TXN: {txId}
        </div>

        <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-[#00e5af]/30 bg-[#6fffcd]/20 px-4 py-2 text-sm font-bold text-[#006148]">
          <Verified className="h-4 w-4" aria-hidden="true" />
          Verified on Hedera
        </div>

        <div className="my-5 border-y border-dashed border-[#373243]/20 py-4 text-center">
          <div className="font-ticket text-xs uppercase tracking-[0.18em] text-[#373243]/70">
            {podiumMode ? "Podium payout" : "Winner payout"}
          </div>
          <div className="mt-1 text-6xl font-bold leading-none tabular-nums text-[#151120]">
            {rewardAmount}
            <span className="ml-2 text-2xl">HBAR</span>
          </div>
          <div className="mt-2 text-lg font-bold text-[#50212d]">
            {podiumMode ? "Top 3 players" : winner?.displayName || "Awaiting winner"}
          </div>
        </div>

        {podiumMode ? (
          <div className="space-y-2 font-ticket text-xs text-[#373243]/72">
            {receipts.map((podiumReceipt) => (
              <div key={podiumReceipt.receiptId} className="grid grid-cols-[auto_1fr_auto] gap-2">
                <span>#{podiumReceipt.placementRank || 1}</span>
                <span className="truncate text-[#151120]">{podiumReceipt.winner.displayName}</span>
                <span className="text-right text-[#151120]">{podiumReceipt.rewardAmountHbar} HBAR</span>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 border-t border-dashed border-[#373243]/20 pt-2">
              <span>Topic</span>
              <span className="truncate text-right text-[#151120]">{receipt?.hcsTopicId || "0.0.preview"}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 font-ticket text-xs text-[#373243]/72">
            <span>Match</span>
            <span className="text-right text-[#151120]">{match.gameMode}</span>
            <span>Score</span>
            <span className="text-right text-[#151120]">{winner?.score || 0}</span>
            <span>Topic</span>
            <span className="truncate text-right text-[#151120]">{receipt?.hcsTopicId || "0.0.preview"}</span>
          </div>
        )}

        <Image src="/crownpay-logo.png" alt="CrownPay logo" width={36} height={36} className="mx-auto mt-5 rounded-md opacity-55" />
      </div>

      {reward?.error && <p className="mt-2 text-center text-sm font-semibold text-[#ffb4ab]">{reward.error}</p>}

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={copyReceipt}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#ffdee3] transition-colors hover:text-[#fff9ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffcd] focus-visible:ring-offset-4 focus-visible:ring-offset-[#211d2d]"
        >
          {copied === "json" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied === "json" ? "Copied" : "Copy JSON"}
        </button>
        <button
          type="button"
          onClick={shareResult}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#ffdee3] transition-colors hover:text-[#fff9ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffcd] focus-visible:ring-offset-4 focus-visible:ring-offset-[#211d2d]"
        >
          {copied === "post" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
          {copied === "post" ? "Copied" : "Share Receipt"}
        </button>
        {reward?.explorerLinks.hcsMessage && (
          <a
            href={reward.explorerLinks.hcsMessage}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#6fffcd] transition-colors hover:text-[#34ffc5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fffcd] focus-visible:ring-offset-4 focus-visible:ring-offset-[#211d2d]"
          >
            HashScan
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
