import type { ExplorerLinks } from "@/lib/types";

const mirrorBaseByNetwork = {
  testnet: "https://hashscan.io/testnet",
  previewnet: "https://hashscan.io/previewnet",
  mainnet: "https://hashscan.io/mainnet",
};

export function getExplorerLinks(input: {
  network?: string;
  transferTxId?: string;
  hcsTopicId?: string;
  hcsMessageTxId?: string;
}): ExplorerLinks {
  const network = input.network === "mainnet" || input.network === "previewnet" ? input.network : "testnet";
  const baseUrl = mirrorBaseByNetwork[network];

  return {
    transfer: input.transferTxId ? `${baseUrl}/transaction/${encodeURIComponent(input.transferTxId)}` : undefined,
    hcsTopic: input.hcsTopicId ? `${baseUrl}/topic/${encodeURIComponent(input.hcsTopicId)}` : undefined,
    hcsMessage: input.hcsMessageTxId ? `${baseUrl}/transaction/${encodeURIComponent(input.hcsMessageTxId)}` : undefined,
  };
}
