import { NextResponse } from "next/server";
import { processCustomRewards, processPodiumRewards, processReward } from "@/lib/hedera/rewardAgent";
import { crownPayMatchToRewardRequest } from "@/lib/sdk/crownpay";
import type { CrownPayMatchResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CrownPayMatchResult;

    if (!body.matchId || !body.gameMode || !body.arena || !Array.isArray(body.players)) {
      return NextResponse.json(
        {
          success: false,
          demoMode: true,
          error: "Invalid CrownPayMatchResult. matchId, gameMode, arena, and players are required.",
          explorerLinks: {},
        },
        { status: 400 },
      );
    }

    const rewardRequest = crownPayMatchToRewardRequest(body);
    const result = body.rewardRecipients?.length
      ? await processCustomRewards(rewardRequest)
      : body.rewardMode === "podium"
        ? await processPodiumRewards(rewardRequest)
        : await processReward(rewardRequest);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        demoMode: true,
        error: error instanceof Error ? error.message : "Unable to process CrownPay reward request.",
        explorerLinks: {},
      },
      { status: 500 },
    );
  }
}
