export type Player = {
  id: string;
  displayName: string;
  avatar: string;
  avatarColor: string;
  hederaAccountId?: string;
  score: number;
  crownHoldSeconds: number;
  eliminations: number;
  survived: boolean;
  rank: number;
};

export type MatchResult = {
  matchId: string;
  gameMode: "Crown Rush";
  arena: string;
  status: "Match Complete" | "Awaiting Agent" | "Rewarded";
  createdAt: string;
  players: Player[];
  winner?: Player;
};

export type PolicyDecision = {
  approved: boolean;
  clamped: boolean;
  reason: string;
  requestedRewardHbar: number;
  finalRewardHbar: number;
  maxRewardHbar: number;
};

export type Receipt = {
  receiptId: string;
  matchId: string;
  gameMode: string;
  arena: string;
  placementRank?: number;
  winner: {
    displayName: string;
    hederaAccountId?: string;
    score: number;
    crownHoldSeconds: number;
    eliminations: number;
  };
  rewardAmountHbar: number;
  reason: string;
  transferTxId?: string;
  hcsTopicId?: string;
  hcsMessageTxId?: string;
  timestamp: string;
  demoMode: boolean;
};

export type ExplorerLinks = {
  transfer?: string;
  hcsTopic?: string;
  hcsMessage?: string;
};

export type RewardRequest = {
  matchId: string;
  gameMode: string;
  arena: string;
  players: Player[];
  winner?: Player;
  requestedRewardHbar: number;
  placementRank?: number;
  rewardMode?: "single" | "podium";
  rewardRecipients?: CrownPayRewardRecipient[];
};

export type CrownPayRewardRecipient = {
  playerId: string;
  amountHbar: number;
  hederaAccountId?: string;
  placementRank?: number;
  label?: string;
};

export type CrownPayMatchPlayer = {
  playerId: string;
  displayName: string;
  hederaAccountId?: string;
  score: number;
  crownHoldSeconds: number;
  eliminations: number;
  survived: boolean;
  rank: number;
  avatar?: string;
  avatarColor?: string;
};

export type CrownPayMatchResult = {
  matchId: string;
  gameMode: string;
  arena: string;
  completedAt?: string;
  winnerPlayerId?: string;
  rewardMode?: "single" | "podium";
  requestedRewardHbar?: number;
  rewardRecipients?: CrownPayRewardRecipient[];
  players: CrownPayMatchPlayer[];
  metadata?: Record<string, string | number | boolean>;
};

export type RewardResponse = {
  success: boolean;
  demoMode: boolean;
  agentReasoning: string;
  policyDecision: PolicyDecision;
  rewardAmountHbar: number;
  transferTxId?: string;
  hcsTopicId?: string;
  hcsMessageTxId?: string;
  receipt?: Receipt;
  receipts?: Receipt[];
  podiumResults?: RewardResponse[];
  explorerLinks: ExplorerLinks;
  error?: string;
};
