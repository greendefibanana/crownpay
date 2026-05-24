# CrownPay Agent

CrownPay Agent is an AI game economy agent for Hedera. After a mock party-game match, it reviews the winner or podium, enforces reward rules, sends tiny testnet HBAR rewards, and publishes verifiable match receipts to Hedera Consensus Service.

It is built for Hedera AI Bounty Week 1: "Fun Basic Hedera Agent." The app is designed to be fun, demo-ready, and usable even before Hedera credentials are configured.

## Features

- Polished one-page Next.js dashboard for a fake multiplayer mode called Crown Rush.
- Random believable match generation with players like CherryKing, PixelNinja, HbarHero, KoiRunner, ToriiGhost, and BambooByte.
- Agent panel with staged reward workflow: read result, check policy, explain decision, send HBAR, publish HCS receipt.
- Server-side policy enforcement before any LLM or blockchain action.
- Podium payouts for 1st, 2nd, and 3rd place using deterministic payout weights.
- Demo mode when Hedera env vars are missing, with clearly marked demo transaction ids.
- Optional OpenAI-compatible reasoning via `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL`.
- Receipt JSON copy, share text copy, HashScan links, and local match history.

## Hedera Integration

The runtime blockchain integration is isolated behind `app/api/agent/reward/route.ts` and `lib/hedera/*`.

The project is structured for Hedera Agent Kit adoption. Current Hedera docs note the JavaScript Agent Kit v4 package moved to `@hashgraph/hedera-agent-kit`, while framework integrations and plugins are separate. To ship a reliable hackathon demo quickly, CrownPay uses `@hashgraph/sdk` as the execution fallback for:

- HBAR transfers with `TransferTransaction`
- HCS topic creation when `HEDERA_HCS_TOPIC_ID` is absent
- HCS receipt publishing with `TopicMessageSubmitTransaction`

The agent reasoning and safety policy stay app-owned. The LLM never decides transaction amounts.

## How Games Integrate

CrownPay is engine-agnostic. A Unity, Unreal, web, mobile, or backend game server can send a completed match result to:

```http
POST /api/crownpay/reward
```

The standardized input schema is `CrownPayMatchResult`:

```ts
type CrownPayMatchResult = {
  matchId: string;
  gameMode: string;
  arena: string;
  completedAt?: string;
  winnerPlayerId?: string;
  rewardMode?: "single" | "podium";
  requestedRewardHbar?: number;
  rewardRecipients?: CrownPayRewardRecipient[];
  players: CrownPayMatchPlayer[];
};

type CrownPayRewardRecipient = {
  playerId: string;
  amountHbar: number;
  hederaAccountId?: string;
  placementRank?: number;
  label?: string;
};
```

Integration modes:

- REST API: POST match results directly to `/api/crownpay/reward`.
- JavaScript SDK: use `lib/sdk/crownpay.ts` for typed helpers such as `submitCrownPayReward` and `submitCrownPayPodiumRewards`.
- Manual Demo Mode: use the dashboard without env vars to show the full flow with demo tx ids.

Internally, `/api/crownpay/reward` maps the standardized schema into the same reward pipeline used by `/api/agent/reward`.

For implementer-defined rewards, send the exact winners, wallets, and amounts:

```json
{
  "rewardRecipients": [
    {
      "playerId": "winner-player-id",
      "hederaAccountId": "0.0.x",
      "amountHbar": 0.05,
      "placementRank": 1,
      "label": "1st place"
    },
    {
      "playerId": "runner-up-player-id",
      "hederaAccountId": "0.0.y",
      "amountHbar": 0.03,
      "placementRank": 2,
      "label": "2nd place"
    }
  ]
}
```

If `rewardRecipients` is omitted, CrownPay keeps the simple demo presets:

- 1st place: 100% of requested reward
- 2nd place: 60% of requested reward
- 3rd place: 40% of requested reward

Run the external game simulator:

```bash
CROWNPAY_WINNING_WALLET=0.0.x CROWNPAY_FIRST_HBAR=0.05 CROWNPAY_SECOND_HBAR=0.03 CROWNPAY_THIRD_HBAR=0.02 npm run simulate:external-game
```

## Trust Model

CrownPay currently trusts the game server to submit honest match results. The agent does not decide who won from raw gameplay footage or replay state. It validates simple reward policy in code:

- a winner must exist
- single-winner rewards must match the rank-one player or supplied winner id
- custom rewards must reference players in the submitted match result
- custom recipient wallets and HBAR amounts are supplied by the implementing game/server
- requested reward is capped by `MAX_REWARD_HBAR`
- real transfers require Hedera operator env vars and a winner account id

The LLM can explain the reward, but it cannot override policy or choose unsafe amounts.

## V1 Limitations

- Match results are accepted as server-submitted JSON.
- No cryptographic match attestation yet.
- No anti-cheat, replay verification, or tournament dispute flow.
- Demo player Hedera account ids are configured manually.
- Podium preset split weights are fixed in code, but production-style integrations should send `rewardRecipients`.
- The JavaScript SDK is local to this repo, not published as an npm package.

## Future Verification Upgrades

- Signed match results from trusted game servers.
- Replay hash or match-state root stored in the HCS receipt.
- Game-server public key registry.
- Optional oracle or referee service for tournament matches.
- NFT badge or token-gated reward rules.
- Published `@crownpay/sdk` package for engine and backend integrations.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Variables:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_KEY=
HEDERA_HCS_TOPIC_ID=
MAX_REWARD_HBAR=2
DEFAULT_REWARD_HBAR=0.5
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
```

Without `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY`, the app runs in demo mode.

## Create And Fund A Hedera Testnet Account

1. Go to the Hedera Developer Portal: [https://portal.hedera.com](https://portal.hedera.com)
2. Create a testnet account.
3. Copy the account id into `HEDERA_OPERATOR_ID`.
4. Copy the private key into `HEDERA_OPERATOR_KEY`.
5. Make sure the account has testnet HBAR.

For player payouts, set a winner account by adding one or more public env vars if desired:

```bash
NEXT_PUBLIC_CHERRYKING_ACCOUNT_ID=0.0.x
NEXT_PUBLIC_PIXELNINJA_ACCOUNT_ID=0.0.x
NEXT_PUBLIC_HBARHERO_ACCOUNT_ID=0.0.x
NEXT_PUBLIC_KOIRUNNER_ACCOUNT_ID=0.0.x
NEXT_PUBLIC_TORIIGHOST_ACCOUNT_ID=0.0.x
NEXT_PUBLIC_BAMBOOBYTE_ACCOUNT_ID=0.0.x
```

If a winner has no account id, CrownPay blocks the real transfer and creates a demo receipt instead.

## Configure HCS

Option A: leave `HEDERA_HCS_TOPIC_ID` blank. CrownPay will attempt to create a topic automatically when a real reward is processed.

Option B: create a topic yourself and set:

```bash
HEDERA_HCS_TOPIC_ID=0.0.x
```

## Demo Script

1. "This is CrownPay Agent, an AI game reward agent on Hedera."
2. "I generate a fake Crown Rush match."
3. "The agent reads the match result and checks reward policy."
4. "It rewards the winner with testnet HBAR."
5. "It publishes a match receipt to Hedera Consensus Service."
6. "This shows how AI agents can operate game economies with public receipts."

Podium demo add-on: "For V1, CrownPay can also reward the top three players from the same match result, publishing one receipt per payout."

## Submission Checklist

- GitHub repo: `<paste link here>`
- Demo/social URL: `<paste link here>`
- Project description: CrownPay Agent turns game results into Hedera rewards and HCS receipts.
- Implementation details: Next.js App Router, TypeScript, Tailwind, Framer Motion, Hedera SDK fallback, Agent Kit-ready adapter layer.
- Feedback submitted as GitHub issue: `<paste link here>`
