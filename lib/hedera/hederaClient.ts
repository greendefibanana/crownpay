import {
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransferTransaction,
} from "@hashgraph/sdk";
import type { HederaActionResult, HederaConfig } from "@/lib/hedera/types";

export function getHederaConfig(): HederaConfig {
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

export function isHederaConfigured(config = getHederaConfig()) {
  return Boolean(config.operatorId && config.operatorKey);
}

function parsePrivateKey(operatorKey: string) {
  try {
    return PrivateKey.fromStringECDSA(operatorKey);
  } catch {
    return PrivateKey.fromString(operatorKey);
  }
}

export function createHederaClient(config = getHederaConfig()) {
  const client =
    config.network === "mainnet"
      ? Client.forMainnet()
      : config.network === "previewnet"
        ? Client.forPreviewnet()
        : Client.forTestnet();

  if (!config.operatorId || !config.operatorKey) {
    throw new Error("Hedera operator credentials are missing.");
  }

  client.setOperator(AccountId.fromString(config.operatorId), parsePrivateKey(config.operatorKey));
  return client;
}

export async function sendHbarReward(input: {
  toAccountId: string;
  amountHbar: number;
  memo: string;
  config?: HederaConfig;
}) {
  const config = input.config || getHederaConfig();
  const client = createHederaClient(config);

  try {
    const response = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(config.operatorId!), new Hbar(-input.amountHbar))
      .addHbarTransfer(AccountId.fromString(input.toAccountId), new Hbar(input.amountHbar))
      .setTransactionMemo(input.memo.slice(0, 100))
      .execute(client);

    await response.getReceipt(client);
    return response.transactionId.toString();
  } finally {
    client.close();
  }
}

export async function publishReceiptToHcs(input: {
  receiptJson: string;
  config?: HederaConfig;
}): Promise<Pick<HederaActionResult, "hcsTopicId" | "hcsMessageTxId">> {
  const config = input.config || getHederaConfig();
  const client = createHederaClient(config);

  try {
    let topicId = config.topicId;

    if (!topicId) {
      const topicResponse = await new TopicCreateTransaction()
        .setTopicMemo("CrownPay Agent match receipts")
        .execute(client);
      const topicReceipt = await topicResponse.getReceipt(client);
      topicId = topicReceipt.topicId?.toString();
    }

    if (!topicId) {
      throw new Error("Unable to resolve or create a Hedera Consensus Service topic.");
    }

    const messageResponse = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(input.receiptJson)
      .execute(client);

    await messageResponse.getReceipt(client);

    return {
      hcsTopicId: topicId,
      hcsMessageTxId: messageResponse.transactionId.toString(),
    };
  } finally {
    client.close();
  }
}
