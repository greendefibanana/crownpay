export type HederaConfig = {
  network: "testnet" | "previewnet" | "mainnet";
  operatorId?: string;
  operatorKey?: string;
  topicId?: string;
  maxRewardHbar: number;
  defaultRewardHbar: number;
};

export type HederaActionResult = {
  transferTxId?: string;
  hcsTopicId?: string;
  hcsMessageTxId?: string;
};
