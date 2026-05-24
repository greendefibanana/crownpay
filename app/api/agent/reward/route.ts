import { NextResponse } from "next/server";
import { processCustomRewards, processPodiumRewards, processReward } from "@/lib/hedera/rewardAgent";
import type { RewardRequest } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RewardRequest;

    if (!body.matchId || !body.gameMode || !body.arena || !Array.isArray(body.players)) {
      return NextResponse.json(
        {
          success: false,
          demoMode: true,
          error: "Invalid reward request. Match id, game mode, arena, and players are required.",
          explorerLinks: {},
        },
        { status: 400 },
      );
    }

    const result = body.rewardRecipients?.length
      ? await processCustomRewards(body)
      : body.rewardMode === "podium"
        ? await processPodiumRewards(body)
        : await processReward(body);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        demoMode: true,
        error: error instanceof Error ? error.message : "Unable to process reward request.",
        explorerLinks: {},
      },
      { status: 500 },
    );
  }
}
