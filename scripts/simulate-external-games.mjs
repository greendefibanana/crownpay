const endpoint = process.env.CROWNPAY_ENDPOINT || "http://localhost:3000/api/crownpay/reward";
const winningWallet = process.env.CROWNPAY_WINNING_WALLET || "0.0.8315960";
const secondWallet = process.env.CROWNPAY_SECOND_WALLET || winningWallet;
const thirdWallet = process.env.CROWNPAY_THIRD_WALLET || winningWallet;

const players = [
  {
    playerId: "unity-cherryking",
    displayName: "CherryKing",
    hederaAccountId: winningWallet,
    score: 980,
    crownHoldSeconds: 52,
    eliminations: 6,
    survived: true,
    rank: 1,
    avatar: "CP",
    avatarColor: "from-pink-300 to-yellow-300",
  },
  {
    playerId: "unity-hbarhero",
    displayName: "HbarHero",
    hederaAccountId: winningWallet,
    score: 884,
    crownHoldSeconds: 43,
    eliminations: 4,
    survived: true,
    rank: 2,
    avatar: "HH",
    avatarColor: "from-cyan-300 to-blue-500",
  },
  {
    playerId: "unity-pixelninja",
    displayName: "PixelNinja",
    hederaAccountId: winningWallet,
    score: 812,
    crownHoldSeconds: 34,
    eliminations: 5,
    survived: false,
    rank: 3,
    avatar: "PN",
    avatarColor: "from-violet-400 to-indigo-500",
  },
  {
    playerId: "unity-koirunner",
    displayName: "KoiRunner",
    hederaAccountId: winningWallet,
    score: 701,
    crownHoldSeconds: 26,
    eliminations: 2,
    survived: true,
    rank: 4,
    avatar: "KR",
    avatarColor: "from-orange-300 to-pink-500",
  },
];

const matchResult = {
  matchId: `EXT-UNITY-CROWN-${Date.now()}`,
  gameMode: "Crown Rush",
  arena: "Cherry Crown Garden",
  completedAt: new Date().toISOString(),
  rewardMode: "podium",
  winnerPlayerId: players[0].playerId,
  rewardRecipients: [
    {
      playerId: players[0].playerId,
      hederaAccountId: winningWallet,
      amountHbar: Number(process.env.CROWNPAY_FIRST_HBAR || process.env.CROWNPAY_TOP_REWARD_HBAR || 0.05),
      placementRank: 1,
      label: "1st place",
    },
    {
      playerId: players[1].playerId,
      hederaAccountId: secondWallet,
      amountHbar: Number(process.env.CROWNPAY_SECOND_HBAR || 0.03),
      placementRank: 2,
      label: "2nd place",
    },
    {
      playerId: players[2].playerId,
      hederaAccountId: thirdWallet,
      amountHbar: Number(process.env.CROWNPAY_THIRD_HBAR || 0.02),
      placementRank: 3,
      label: "3rd place",
    },
  ],
  players,
  metadata: {
    sourceEngine: "Unity Dedicated Server",
    build: "external-game-sim",
    trustModel: "server-authoritative mock result",
  },
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(matchResult),
});

const result = await response.json();

console.log(
  JSON.stringify(
    {
      endpoint,
      status: response.status,
      success: result.success,
      demoMode: result.demoMode,
      totalRewardHbar: result.rewardAmountHbar,
      hcsTopicId: result.hcsTopicId,
      podium: result.podiumResults?.map((podiumResult) => ({
        rank: podiumResult.receipt?.placementRank,
        winner: podiumResult.receipt?.winner?.displayName,
        amount: podiumResult.rewardAmountHbar,
        transferTxId: podiumResult.transferTxId,
        hcsMessageTxId: podiumResult.hcsMessageTxId,
        error: podiumResult.error,
      })),
      error: result.error,
    },
    null,
    2,
  ),
);

if (!response.ok || !result.success) {
  process.exitCode = 1;
}
