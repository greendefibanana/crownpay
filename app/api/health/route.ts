import { NextResponse } from "next/server";
import { getAgentKitRuntimeStatus } from "@/lib/hedera/agentKitAdapter";
import { getHederaConfig, isHederaConfigured } from "@/lib/hedera/hederaClient";

export const runtime = "nodejs";

export function GET() {
  const config = getHederaConfig();
  const agentKit = getAgentKitRuntimeStatus(config);

  return NextResponse.json({
    ok: true,
    app: "CrownPay Agent",
    network: config.network,
    hederaConfigured: isHederaConfigured(config),
    hcsTopicConfigured: Boolean(config.topicId),
    agentKit,
    demoMode: !isHederaConfigured(config),
    maxRewardHbar: config.maxRewardHbar,
    defaultRewardHbar: config.defaultRewardHbar,
    timestamp: new Date().toISOString(),
  });
}
