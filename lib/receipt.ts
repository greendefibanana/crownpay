import type { Receipt, RewardRequest } from "@/lib/types";

export function createReceipt(input: {
  request: RewardRequest;
  reason: string;
  rewardAmountHbar: number;
  transferTxId?: string;
  hcsTopicId?: string;
  hcsMessageTxId?: string;
  demoMode: boolean;
}): Receipt {
  const winner = input.request.winner;

  if (!winner) {
    throw new Error("Cannot create a receipt without a winner.");
  }

  return {
    receiptId: `receipt_${input.request.matchId}_${Date.now()}`,
    matchId: input.request.matchId,
    gameMode: input.request.gameMode,
    arena: input.request.arena,
    placementRank: input.request.placementRank || winner.rank,
    winner: {
      displayName: winner.displayName,
      hederaAccountId: winner.hederaAccountId,
      score: winner.score,
      crownHoldSeconds: winner.crownHoldSeconds,
      eliminations: winner.eliminations,
    },
    rewardAmountHbar: input.rewardAmountHbar,
    reason: input.reason,
    transferTxId: input.transferTxId,
    hcsTopicId: input.hcsTopicId,
    hcsMessageTxId: input.hcsMessageTxId,
    timestamp: new Date().toISOString(),
    demoMode: input.demoMode,
  };
}
