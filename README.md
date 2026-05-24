# CrownPay Agent

CrownPay Agent is an AI game reward agent on Hedera. Game servers submit completed match results, CrownPay checks reward policy, sends testnet HBAR to the configured winners, and publishes public match receipts to Hedera Consensus Service.

Built for Hedera AI Bounty Week 1: "Fun Basic Hedera Agent."

## Links

- Live demo: [https://crownpay.vercel.app/](https://crownpay.vercel.app/)
- GitHub repo: [greendefibanana/crownpay](https://github.com/greendefibanana/crownpay)
- Feedback issue: [hashgraph/hedera-agent-kit-js#856](https://github.com/hashgraph/hedera-agent-kit-js/issues/856)

## Why It Fits

CrownPay demonstrates a practical AI agent that can operate a game economy on Hedera:

- reads match results
- explains reward decisions
- enforces payout rules in code
- sends HBAR rewards on testnet
- publishes verifiable HCS receipts
- works in demo mode when Hedera credentials are missing

The product is framed as an engine-agnostic reward layer. A Unity, Unreal, web, or backend game server can integrate by sending one standardized match payload.

## Features

- Polished one-page Next.js dashboard for a fake party-game mode called Crown Rush
- Random match generation with mock players and believable stats
- AI-style reward agent panel with staged progress
- Custom reward recipients: games choose winners, wallets, and HBAR amounts
- Hedera testnet HBAR transfers
- HCS receipt publishing
- HashScan links for transactions and receipts
- Demo mode fallback without Hedera credentials
- Local SDK helper for game/server integrations
- External game simulator script

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- Hedera SDK fallback via `@hashgraph/sdk`
- OpenAI-compatible reasoning optional via env vars

## Architecture

The frontend calls server routes only. Blockchain actions are isolated behind the Hedera service layer.

```txt
Game Server
  -> POST /api/crownpay/reward
  -> CrownPay policy + reasoning
  -> Hedera HBAR transfer
  -> HCS receipt
```

Key files:

- `app/page.tsx` - main dashboard
- `app/api/agent/reward/route.ts` - dashboard reward route
- `app/api/crownpay/reward/route.ts` - engine-agnostic integration route
- `lib/hedera/rewardAgent.ts` - policy, reasoning, reward orchestration
- `lib/hedera/hederaClient.ts` - Hedera SDK client, HBAR transfer, HCS publish
- `lib/sdk/crownpay.ts` - local SDK helper
- `scripts/simulate-external-games.mjs` - external game integration simulation

## How Games Integrate

Games send completed match results to:

```http
POST /api/crownpay/reward
```

Example:

```ts
await fetch("/api/crownpay/reward", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(matchResult),
});
```

Schema:

```ts
type CrownPayMatchResult = {
  matchId: string;
  gameMode: string;
  arena: string;
  completedAt?: string;
  players: CrownPayMatchPlayer[];
  rewardRecipients?: CrownPayRewardRecipient[];
  metadata?: Record<string, string | number | boolean>;
};

type CrownPayMatchPlayer = {
  playerId: string;
  displayName: string;
  hederaAccountId?: string;
  score: number;
  crownHoldSeconds: number;
  eliminations: number;
  survived: boolean;
  rank: number;
};

type CrownPayRewardRecipient = {
  playerId: string;
  amountHbar: number;
  hederaAccountId?: string;
  placementRank?: number;
  label?: string;
};
```

The implementing game controls:

- how many winners get paid
- each winner's wallet
- each reward amount in HBAR
- labels and placements

CrownPay validates that each rewarded player exists in the submitted match result, clamps unsafe amounts by operator policy, then executes the payout.

## Example Match Payload

```json
{
  "matchId": "match-001",
  "gameMode": "Crown Rush",
  "arena": "Cherry Crown Garden",
  "players": [
    {
      "playerId": "p1",
      "displayName": "CherryKing",
      "hederaAccountId": "0.0.123",
      "score": 920,
      "crownHoldSeconds": 48,
      "eliminations": 5,
      "survived": true,
      "rank": 1
    }
  ],
  "rewardRecipients": [
    {
      "playerId": "p1",
      "hederaAccountId": "0.0.123",
      "amountHbar": 0.05,
      "placementRank": 1,
      "label": "1st place"
    }
  ]
}
```

## Trust Model

V1 trusts the game server to submit honest match results. CrownPay does not verify raw gameplay or replay files yet.

The current policy layer validates:

- recipient players exist in the submitted match
- reward amount is greater than zero
- reward amount does not exceed `MAX_REWARD_HBAR`
- real transfers require Hedera operator credentials
- real transfers require recipient wallet IDs

The LLM can explain a reward decision, but it never chooses transaction amounts or overrides policy.

## V1 Limitations

- Match results are server-submitted JSON
- No signed match attestations yet
- No replay verification or anti-cheat layer yet
- Local SDK is included in this repo, not published to npm
- Demo player wallet IDs are configured through env vars for the dashboard flow

## Future Verification Upgrades

- Signed match results from trusted game servers
- Replay hash or match-state root stored in the HCS receipt
- Game-server public key registry
- Optional referee/oracle service for competitive matches
- Published `@crownpay/sdk` package
- Configurable reward policy templates per game

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Operator/deployment config:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_KEY=
HEDERA_HCS_TOPIC_ID=
MAX_REWARD_HBAR=2
DEFAULT_REWARD_HBAR=0.05
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
```

`HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` are only needed by the hosted CrownPay operator. Game developers integrating through the API send match JSON and recipient wallets; they do not need your operator key.

`HEDERA_HCS_TOPIC_ID` is optional. If omitted, CrownPay attempts to create an HCS topic when processing a real reward.

`MAX_REWARD_HBAR` is the operator safety cap.

`DEFAULT_REWARD_HBAR` is used by the dashboard demo flow. External game integrations should send explicit `rewardRecipients`.

Optional dashboard mock player wallets:

```bash
NEXT_PUBLIC_CHERRYKING_ACCOUNT_ID=
NEXT_PUBLIC_PIXELNINJA_ACCOUNT_ID=
NEXT_PUBLIC_HBARHERO_ACCOUNT_ID=
NEXT_PUBLIC_KOIRUNNER_ACCOUNT_ID=
NEXT_PUBLIC_TORIIGHOST_ACCOUNT_ID=
NEXT_PUBLIC_BAMBOOBYTE_ACCOUNT_ID=
```

Without Hedera operator credentials, CrownPay runs in demo mode.

## Hedera Testnet Setup

1. Create a Hedera testnet account at [https://portal.hedera.com](https://portal.hedera.com).
2. Fund it with testnet HBAR.
3. Set `HEDERA_OPERATOR_ID`.
4. Set `HEDERA_OPERATOR_KEY`.
5. Optionally create an HCS topic and set `HEDERA_HCS_TOPIC_ID`.

## External Game Simulation

Run:

```bash
CROWNPAY_WINNING_WALLET=0.0.x npm run simulate:external-game
```

Optional custom amounts:

```bash
CROWNPAY_FIRST_HBAR=0.05 CROWNPAY_SECOND_HBAR=0.03 CROWNPAY_THIRD_HBAR=0.02 npm run simulate:external-game
```

## Demo Script

1. "This is CrownPay Agent, an AI game reward agent on Hedera."
2. "I generate a fake Crown Rush match."
3. "The agent reads the match result and checks reward policy."
4. "It rewards the winner with testnet HBAR."
5. "It publishes a match receipt to Hedera Consensus Service."
6. "This shows how AI agents can operate game economies with public receipts."

## Submission Checklist

- GitHub repo: [greendefibanana/crownpay](https://github.com/greendefibanana/crownpay)
- Demo/social URL: [https://crownpay.vercel.app/](https://crownpay.vercel.app/)
- Project description: CrownPay Agent turns game results into Hedera rewards and HCS receipts.
- Implementation details: Next.js App Router, TypeScript, Tailwind, Framer Motion, Hedera SDK fallback, Agent Kit-ready adapter layer.
- Feedback submitted as GitHub issue: [hashgraph/hedera-agent-kit-js#856](https://github.com/hashgraph/hedera-agent-kit-js/issues/856)
