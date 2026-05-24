import type { CrownPayMatchResult, Player, RewardRequest, RewardResponse } from "@/lib/types";

export type { CrownPayMatchPlayer, CrownPayMatchResult, CrownPayRewardRecipient, RewardResponse } from "@/lib/types";

const defaultAvatarColors = [
  "from-rose-400 to-fuchsia-500",
  "from-cyan-300 to-blue-500",
  "from-violet-400 to-indigo-500",
  "from-lime-300 to-emerald-500",
];

export function crownPayMatchToRewardRequest(match: CrownPayMatchResult): RewardRequest {
  const players: Player[] = match.players
    .map((player, index) => ({
      id: player.playerId,
      displayName: player.displayName,
      avatar: player.avatar || "👑",
      avatarColor: player.avatarColor || defaultAvatarColors[index % defaultAvatarColors.length],
      hederaAccountId: player.hederaAccountId,
      score: player.score,
      crownHoldSeconds: player.crownHoldSeconds,
      eliminations: player.eliminations,
      survived: player.survived,
      rank: player.rank,
    }))
    .sort((a, b) => a.rank - b.rank);

  const winner =
    players.find((player) => player.id === match.winnerPlayerId) ||
    players.find((player) => player.rank === 1);

  return {
    matchId: match.matchId,
    gameMode: match.gameMode,
    arena: match.arena,
    players,
    winner,
    requestedRewardHbar: match.requestedRewardHbar ?? 0.5,
    rewardMode: match.rewardMode,
    rewardRecipients: match.rewardRecipients,
  };
}

export function buildCrownPayRecipients(
  recipients: Array<{ playerId: string; amountHbar: number; hederaAccountId?: string; placementRank?: number; label?: string }>,
) {
  return recipients;
}

export async function submitCrownPayReward(
  match: CrownPayMatchResult,
  options: { endpoint?: string; fetcher?: typeof fetch } = {},
): Promise<RewardResponse> {
  const fetcher = options.fetcher || fetch;
  const endpoint = options.endpoint || "/api/crownpay/reward";
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(match),
  });

  return (await response.json()) as RewardResponse;
}

export async function submitCrownPayPodiumRewards(
  match: CrownPayMatchResult,
  options: { endpoint?: string; fetcher?: typeof fetch } = {},
): Promise<RewardResponse> {
  return submitCrownPayReward(
    {
      ...match,
      rewardMode: "podium",
    },
    options,
  );
}
