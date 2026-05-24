import type { MatchResult } from "@/lib/types";

const basePlayers = [
  { displayName: "CherryKing", avatar: "🍒", avatarColor: "from-rose-400 to-fuchsia-500", hederaAccountId: process.env.NEXT_PUBLIC_CHERRYKING_ACCOUNT_ID },
  { displayName: "PixelNinja", avatar: "🥷", avatarColor: "from-violet-400 to-indigo-500", hederaAccountId: process.env.NEXT_PUBLIC_PIXELNINJA_ACCOUNT_ID },
  { displayName: "HbarHero", avatar: "ℏ", avatarColor: "from-cyan-300 to-blue-500", hederaAccountId: process.env.NEXT_PUBLIC_HBARHERO_ACCOUNT_ID },
  { displayName: "KoiRunner", avatar: "🎏", avatarColor: "from-orange-300 to-pink-500", hederaAccountId: process.env.NEXT_PUBLIC_KOIRUNNER_ACCOUNT_ID },
  { displayName: "ToriiGhost", avatar: "⛩", avatarColor: "from-slate-300 to-purple-500", hederaAccountId: process.env.NEXT_PUBLIC_TORIIGHOST_ACCOUNT_ID },
  { displayName: "BambooByte", avatar: "🎋", avatarColor: "from-lime-300 to-emerald-500", hederaAccountId: process.env.NEXT_PUBLIC_BAMBOOBYTE_ACCOUNT_ID },
];

const arenas = ["Cherry Crown Garden", "Neon Mochi Pier", "Pixel Shrine Rooftop", "Moonlit Bento Bay"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockMatch(): MatchResult {
  const shuffled = [...basePlayers].sort(() => Math.random() - 0.5).slice(0, 4);
  const players = shuffled.map((player, index) => {
    const crownHoldSeconds = randomInt(8, 58);
    const eliminations = randomInt(0, 7);
    const survived = Math.random() > 0.22;
    const score = 420 + crownHoldSeconds * 8 + eliminations * 46 + (survived ? 130 : 0) + randomInt(0, 90);

    return {
      id: `${player.displayName.toLowerCase()}-${index}`,
      ...player,
      score,
      crownHoldSeconds,
      eliminations,
      survived,
      rank: 0,
    };
  });

  const ranked = players
    .sort((a, b) => b.score - a.score || b.crownHoldSeconds - a.crownHoldSeconds)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  return {
    matchId: `CP-${Date.now().toString(36).toUpperCase()}-${randomInt(100, 999)}`,
    gameMode: "Crown Rush",
    arena: arenas[randomInt(0, arenas.length - 1)],
    status: "Awaiting Agent",
    createdAt: new Date().toISOString(),
    players: ranked,
    winner: ranked[0],
  };
}

export function createOpeningMatch(): MatchResult {
  const players = [
    {
      id: "cherryking-opening",
      displayName: "CherryKing",
      avatar: "🍒",
      avatarColor: "from-rose-400 to-fuchsia-500",
      hederaAccountId: process.env.NEXT_PUBLIC_CHERRYKING_ACCOUNT_ID,
      score: 920,
      crownHoldSeconds: 48,
      eliminations: 5,
      survived: true,
      rank: 1,
    },
    {
      id: "hbarhero-opening",
      displayName: "HbarHero",
      avatar: "ℏ",
      avatarColor: "from-cyan-300 to-blue-500",
      hederaAccountId: process.env.NEXT_PUBLIC_HBARHERO_ACCOUNT_ID,
      score: 854,
      crownHoldSeconds: 41,
      eliminations: 4,
      survived: true,
      rank: 2,
    },
    {
      id: "pixelninja-opening",
      displayName: "PixelNinja",
      avatar: "🥷",
      avatarColor: "from-violet-400 to-indigo-500",
      hederaAccountId: process.env.NEXT_PUBLIC_PIXELNINJA_ACCOUNT_ID,
      score: 801,
      crownHoldSeconds: 36,
      eliminations: 5,
      survived: false,
      rank: 3,
    },
    {
      id: "bamboobyte-opening",
      displayName: "BambooByte",
      avatar: "🎋",
      avatarColor: "from-lime-300 to-emerald-500",
      hederaAccountId: process.env.NEXT_PUBLIC_BAMBOOBYTE_ACCOUNT_ID,
      score: 744,
      crownHoldSeconds: 28,
      eliminations: 3,
      survived: true,
      rank: 4,
    },
  ];

  return {
    matchId: "CP-DEMO-CROWN-001",
    gameMode: "Crown Rush",
    arena: "Cherry Crown Garden",
    status: "Awaiting Agent",
    createdAt: "2026-05-23T00:00:00.000Z",
    players,
    winner: players[0],
  };
}
