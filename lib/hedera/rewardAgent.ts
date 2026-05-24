import { createReceipt } from "@/lib/receipt";
import type { PolicyDecision, RewardRequest, RewardResponse } from "@/lib/types";
import { getExplorerLinks } from "@/lib/hedera/explorer";
import {
  getHederaConfig,
  isHederaConfigured,
  publishReceiptToHcs,
  sendHbarReward,
} from "@/lib/hedera/hederaClient";

const podiumMultipliers: Record<number, number> = {
  1: 1,
  2: 0.6,
  3: 0.4,
};

function validatePolicy(request: RewardRequest): PolicyDecision {
  const config = getHederaConfig();
  const requestedRewardHbar = Number(request.requestedRewardHbar || config.defaultRewardHbar);
  const maxRewardHbar = Number.isFinite(config.maxRewardHbar) ? config.maxRewardHbar : 2;
  const expectedRank = request.placementRank || 1;

  if (!request.winner) {
    return {
      approved: false,
      clamped: false,
      reason: "No winner was supplied, so the reward is blocked.",
      requestedRewardHbar,
      finalRewardHbar: 0,
      maxRewardHbar,
    };
  }

  const knownWinner = request.players.some((player) => player.id === request.winner?.id && player.rank === expectedRank);

  if (!knownWinner) {
    return {
      approved: false,
      clamped: false,
      reason: `The requested recipient does not match rank ${expectedRank} in the match result.`,
      requestedRewardHbar,
      finalRewardHbar: 0,
      maxRewardHbar,
    };
  }

  const finalRewardHbar = Math.min(Math.max(requestedRewardHbar, 0), maxRewardHbar);

  if (finalRewardHbar <= 0) {
    return {
      approved: false,
      clamped: false,
      reason: "Reward amount must be greater than zero.",
      requestedRewardHbar,
      finalRewardHbar,
      maxRewardHbar,
    };
  }

  return {
    approved: true,
    clamped: requestedRewardHbar > maxRewardHbar,
    reason:
      requestedRewardHbar > maxRewardHbar
        ? `Requested reward exceeded the ${maxRewardHbar} HBAR policy cap, so it was clamped.`
        : `Rank ${expectedRank} recipient is verified and reward is inside the policy cap.`,
    requestedRewardHbar,
    finalRewardHbar,
    maxRewardHbar,
  };
}

async function generateReasoning(request: RewardRequest, policy: PolicyDecision) {
  const winner = request.winner;

  if (!winner) {
    return "No crown carrier survived the final result, so CrownPay Agent blocked the payout.";
  }

  const rankCopy = request.placementRank && request.placementRank > 1 ? `rank ${request.placementRank}` : "the crown";
  const localReason = `${winner.displayName} secured ${rankCopy}, held the crown for ${winner.crownHoldSeconds} seconds, finished with ${winner.score} score, landed ${winner.eliminations} eliminations, and ${winner.survived ? "survived the final rush" : "still topped the scoreboard"}. Reward ${policy.approved ? "approved" : "blocked"}.${policy.clamped ? " The payout was trimmed to stay under policy." : ""}`;

  if (!process.env.OPENAI_API_KEY) {
    return localReason;
  }

  try {
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Write one short, fun explanation for a game reward agent. Never choose the amount or override policy.",
          },
          {
            role: "user",
            content: JSON.stringify({
              winner,
              policy,
              gameMode: request.gameMode,
              arena: request.arena,
            }),
          },
        ],
        temperature: 0.7,
        max_tokens: 90,
      }),
    });

    if (!response.ok) {
      return localReason;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || localReason;
  } catch {
    return localReason;
  }
}

function fakeTxId(prefix: string) {
  return `${prefix}-demo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export async function processReward(request: RewardRequest): Promise<RewardResponse> {
  const config = getHederaConfig();
  const policyDecision = validatePolicy(request);
  const agentReasoning = await generateReasoning(request, policyDecision);
  const missingWinnerAccount = !request.winner?.hederaAccountId;
  const demoMode = !isHederaConfigured(config) || missingWinnerAccount;

  if (!policyDecision.approved) {
    return {
      success: false,
      demoMode: true,
      agentReasoning,
      policyDecision,
      rewardAmountHbar: 0,
      explorerLinks: {},
      error: policyDecision.reason,
    };
  }

  try {
    let transferTxId: string | undefined;
    let hcsTopicId: string | undefined;
    let hcsMessageTxId: string | undefined;

    const preReceipt = createReceipt({
      request,
      reason: agentReasoning,
      rewardAmountHbar: policyDecision.finalRewardHbar,
      transferTxId: demoMode ? fakeTxId("transfer") : undefined,
      hcsTopicId: demoMode ? "0.0.demo-topic" : undefined,
      hcsMessageTxId: demoMode ? fakeTxId("hcs") : undefined,
      demoMode,
    });

    if (!demoMode && request.winner?.hederaAccountId) {
      transferTxId = await sendHbarReward({
        toAccountId: request.winner.hederaAccountId,
        amountHbar: policyDecision.finalRewardHbar,
        memo: `CrownPay reward ${request.matchId}`,
        config,
      });

      const receiptForHcs = {
        ...preReceipt,
        transferTxId,
        demoMode: false,
      };

      const hcsResult = await publishReceiptToHcs({
        receiptJson: JSON.stringify(receiptForHcs),
        config,
      });
      hcsTopicId = hcsResult.hcsTopicId;
      hcsMessageTxId = hcsResult.hcsMessageTxId;
    } else {
      transferTxId = preReceipt.transferTxId;
      hcsTopicId = preReceipt.hcsTopicId;
      hcsMessageTxId = preReceipt.hcsMessageTxId;
    }

    const receipt = createReceipt({
      request,
      reason: agentReasoning,
      rewardAmountHbar: policyDecision.finalRewardHbar,
      transferTxId,
      hcsTopicId,
      hcsMessageTxId,
      demoMode,
    });

    return {
      success: true,
      demoMode,
      agentReasoning,
      policyDecision,
      rewardAmountHbar: policyDecision.finalRewardHbar,
      transferTxId,
      hcsTopicId,
      hcsMessageTxId,
      receipt,
      explorerLinks: getExplorerLinks({
        network: config.network,
        transferTxId,
        hcsTopicId,
        hcsMessageTxId,
      }),
      error: demoMode && missingWinnerAccount ? "Winner has no Hedera account configured, so a demo receipt was created." : undefined,
    };
  } catch (error) {
    return {
      success: false,
      demoMode: false,
      agentReasoning,
      policyDecision,
      rewardAmountHbar: policyDecision.finalRewardHbar,
      explorerLinks: {},
      error: error instanceof Error ? error.message : "Unexpected Hedera reward error.",
    };
  }
}

export async function processPodiumRewards(request: RewardRequest): Promise<RewardResponse> {
  const topPlayers = [...request.players].sort((a, b) => a.rank - b.rank).filter((player) => player.rank >= 1 && player.rank <= 3);
  const baseReward = Number(request.requestedRewardHbar || getHederaConfig().defaultRewardHbar);

  if (topPlayers.length === 0) {
    const policyDecision: PolicyDecision = {
      approved: false,
      clamped: false,
      reason: "No podium players were supplied, so podium rewards are blocked.",
      requestedRewardHbar: baseReward,
      finalRewardHbar: 0,
      maxRewardHbar: getHederaConfig().maxRewardHbar,
    };

    return {
      success: false,
      demoMode: true,
      agentReasoning: "CrownPay could not find rank 1, 2, or 3 in the match result.",
      policyDecision,
      rewardAmountHbar: 0,
      explorerLinks: {},
      podiumResults: [],
      receipts: [],
      error: policyDecision.reason,
    };
  }

  const podiumResults: RewardResponse[] = [];

  for (const player of topPlayers) {
    podiumResults.push(
      await processReward({
        ...request,
        winner: player,
        placementRank: player.rank,
        rewardMode: "podium",
        requestedRewardHbar: Number((baseReward * (podiumMultipliers[player.rank] || 0.25)).toFixed(8)),
      }),
    );
  }

  const receipts = podiumResults.flatMap((result) => (result.receipt ? [result.receipt] : []));
  const failedResult = podiumResults.find((result) => !result.success);
  const totalReward = podiumResults.reduce((sum, result) => sum + (result.success ? result.rewardAmountHbar : 0), 0);
  const demoMode = podiumResults.some((result) => result.demoMode);

  return {
    success: podiumResults.every((result) => result.success),
    demoMode,
    agentReasoning: podiumResults
      .map((result, index) => `#${topPlayers[index]?.rank}: ${result.agentReasoning}`)
      .join(" "),
    policyDecision: failedResult?.policyDecision || podiumResults[0].policyDecision,
    rewardAmountHbar: Number(totalReward.toFixed(8)),
    transferTxId: podiumResults[0]?.transferTxId,
    hcsTopicId: podiumResults[0]?.hcsTopicId,
    hcsMessageTxId: podiumResults[0]?.hcsMessageTxId,
    receipt: receipts[0],
    receipts,
    podiumResults,
    explorerLinks: podiumResults[0]?.explorerLinks || {},
    error: failedResult?.error,
  };
}

export async function processCustomRewards(request: RewardRequest): Promise<RewardResponse> {
  const recipients = request.rewardRecipients || [];

  if (recipients.length === 0) {
    const policyDecision: PolicyDecision = {
      approved: false,
      clamped: false,
      reason: "No reward recipients were supplied.",
      requestedRewardHbar: 0,
      finalRewardHbar: 0,
      maxRewardHbar: getHederaConfig().maxRewardHbar,
    };

    return {
      success: false,
      demoMode: true,
      agentReasoning: "CrownPay needs at least one recipient wallet and amount before it can reward a match.",
      policyDecision,
      rewardAmountHbar: 0,
      explorerLinks: {},
      receipts: [],
      podiumResults: [],
      error: policyDecision.reason,
    };
  }

  const customResults: RewardResponse[] = [];

  for (const recipient of recipients) {
    const player = request.players.find((candidate) => candidate.id === recipient.playerId);

    if (!player) {
      const policyDecision: PolicyDecision = {
        approved: false,
        clamped: false,
        reason: `Reward recipient ${recipient.playerId} was not found in the match result.`,
        requestedRewardHbar: Number(recipient.amountHbar || 0),
        finalRewardHbar: 0,
        maxRewardHbar: getHederaConfig().maxRewardHbar,
      };

      customResults.push({
        success: false,
        demoMode: true,
        agentReasoning: `CrownPay blocked ${recipient.playerId} because the player was not part of the submitted match.`,
        policyDecision,
        rewardAmountHbar: 0,
        explorerLinks: {},
        error: policyDecision.reason,
      });
      continue;
    }

    customResults.push(
      await processReward({
        ...request,
        winner: {
          ...player,
          hederaAccountId: recipient.hederaAccountId || player.hederaAccountId,
        },
        placementRank: recipient.placementRank || player.rank,
        rewardMode: recipients.length > 1 ? "podium" : "single",
        requestedRewardHbar: Number(recipient.amountHbar || 0),
      }),
    );
  }

  const receipts = customResults.flatMap((result) => (result.receipt ? [result.receipt] : []));
  const failedResult = customResults.find((result) => !result.success);
  const totalReward = customResults.reduce((sum, result) => sum + (result.success ? result.rewardAmountHbar : 0), 0);
  const demoMode = customResults.some((result) => result.demoMode);

  return {
    success: customResults.every((result) => result.success),
    demoMode,
    agentReasoning: customResults
      .map((result, index) => `${recipients[index]?.label || `Reward ${index + 1}`}: ${result.agentReasoning}`)
      .join(" "),
    policyDecision: failedResult?.policyDecision || customResults[0].policyDecision,
    rewardAmountHbar: Number(totalReward.toFixed(8)),
    transferTxId: customResults[0]?.transferTxId,
    hcsTopicId: customResults[0]?.hcsTopicId,
    hcsMessageTxId: customResults[0]?.hcsMessageTxId,
    receipt: receipts[0],
    receipts,
    podiumResults: customResults,
    explorerLinks: customResults[0]?.explorerLinks || {},
    error: failedResult?.error,
  };
}
