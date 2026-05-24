import {
  HederaAgentAPI,
  HederaBuilder,
  type Context,
} from "@hashgraph/hedera-agent-kit";
import { AccountId, Client, Hbar, PrivateKey } from "@hiero-ledger/sdk";
import type { HederaActionResult, HederaConfig } from "@/lib/hedera/types";

export type AgentKitRuntimeStatus = {
  packageName: "@hashgraph/hedera-agent-kit";
  configured: boolean;
  available: boolean;
  network: HederaConfig["network"];
  executionMode: "agent-kit-builder" | "sdk-fallback" | "demo-mode";
  toolCount: number;
  reason?: string;
};

function parseAgentKitPrivateKey(operatorKey: string) {
  try {
    return PrivateKey.fromStringECDSA(operatorKey);
  } catch {
    return PrivateKey.fromString(operatorKey);
  }
}

function getAgentKitDefaultConfig(): HederaConfig {
  const network = process.env.HEDERA_NETWORK;

  return {
    network: network === "mainnet" || network === "previewnet" ? network : "testnet",
    operatorId: process.env.HEDERA_OPERATOR_ID,
    operatorKey: process.env.HEDERA_OPERATOR_KEY,
    topicId: process.env.HEDERA_HCS_TOPIC_ID,
    maxRewardHbar: Number(process.env.MAX_REWARD_HBAR || 2),
    defaultRewardHbar: Number(process.env.DEFAULT_REWARD_HBAR || 0.5),
  };
}

function isAgentKitConfigured(config: HederaConfig) {
  return Boolean(config.operatorId && config.operatorKey);
}

export function createAgentKitClient(config = getAgentKitDefaultConfig()) {
  const client =
    config.network === "mainnet"
      ? Client.forMainnet()
      : config.network === "previewnet"
        ? Client.forPreviewnet()
        : Client.forTestnet();

  if (!config.operatorId || !config.operatorKey) {
    throw new Error("Hedera operator credentials are missing.");
  }

  client.setOperator(
    AccountId.fromString(config.operatorId),
    parseAgentKitPrivateKey(config.operatorKey),
  );

  return client;
}

export function createAgentKitRuntime(config = getAgentKitDefaultConfig()) {
  const client = createAgentKitClient(config);
  const context: Context = {
    accountId: config.operatorId,
  };
  const agentApi = new HederaAgentAPI(client, context);

  return { agentApi, client };
}

export function getAgentKitRuntimeStatus(config = getAgentKitDefaultConfig()): AgentKitRuntimeStatus {
  if (!isAgentKitConfigured(config)) {
    return {
      packageName: "@hashgraph/hedera-agent-kit",
      configured: false,
      available: false,
      network: config.network,
      executionMode: "demo-mode",
      toolCount: 0,
      reason: "Hedera operator credentials are not configured, so CrownPay runs in demo mode.",
    };
  }

  let client: Client | undefined;

  try {
    const runtime = createAgentKitRuntime(config);
    client = runtime.client;

    return {
      packageName: "@hashgraph/hedera-agent-kit",
      configured: true,
      available: true,
      network: config.network,
      executionMode: "agent-kit-builder",
      toolCount: runtime.agentApi.tools.length,
    };
  } catch (error) {
    return {
      packageName: "@hashgraph/hedera-agent-kit",
      configured: true,
      available: false,
      network: config.network,
      executionMode: "sdk-fallback",
      toolCount: 0,
      reason: error instanceof Error ? error.message : "Agent Kit runtime failed to initialize.",
    };
  } finally {
    client?.close();
  }
}

export async function sendHbarRewardWithAgentKit(input: {
  toAccountId: string;
  amountHbar: number;
  memo: string;
  config?: HederaConfig;
}) {
  const config = input.config || getAgentKitDefaultConfig();
  const client = createAgentKitClient(config);

  try {
    const transaction = HederaBuilder.transferHbar({
      hbarTransfers: [
        {
          accountId: AccountId.fromString(config.operatorId!),
          amount: new Hbar(-input.amountHbar),
        },
        {
          accountId: AccountId.fromString(input.toAccountId),
          amount: new Hbar(input.amountHbar),
        },
      ],
      transactionMemo: input.memo.slice(0, 100),
    });

    const response = await transaction.execute(client);
    await response.getReceipt(client);
    return response.transactionId.toString();
  } finally {
    client.close();
  }
}

export async function publishReceiptToHcsWithAgentKit(input: {
  receiptJson: string;
  config?: HederaConfig;
}): Promise<Pick<HederaActionResult, "hcsTopicId" | "hcsMessageTxId">> {
  const config = input.config || getAgentKitDefaultConfig();
  const client = createAgentKitClient(config);

  try {
    let topicId = config.topicId;

    if (!topicId) {
      const topicResponse = await HederaBuilder.createTopic({
        autoRenewAccountId: config.operatorId!,
        topicMemo: "CrownPay Agent match receipts",
      }).execute(client);
      const topicReceipt = await topicResponse.getReceipt(client);
      topicId = topicReceipt.topicId?.toString();
    }

    if (!topicId) {
      throw new Error("Unable to resolve or create a Hedera Consensus Service topic.");
    }

    const messageResponse = await HederaBuilder.submitTopicMessage({
      topicId,
      message: input.receiptJson,
      transactionMemo: "CrownPay match receipt",
    }).execute(client);

    await messageResponse.getReceipt(client);

    return {
      hcsTopicId: topicId,
      hcsMessageTxId: messageResponse.transactionId.toString(),
    };
  } finally {
    client.close();
  }
}
