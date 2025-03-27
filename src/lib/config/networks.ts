import { baseSepolia } from "viem/chains";

import { base } from "viem/chains";

export interface ContractAddresses {
  [chainId: number]: {
    [contractName: string]: `0x${string}` | undefined;
  };
}

// All contract addresses organized by chain ID
export const CONTRACT_ADDRESSES: ContractAddresses = {
  [baseSepolia.id]: {
    Paynest: "0x2C1868A15b26A023FDA31532EBc40550dB08c172",
    MockUSDT: "0xc77595f7BfC1d9bde189B425fa277c01d79B331E",
    AddressRegistry: "0x8e42Df877291dDD168f921f075DdA563cb245D5a",
  },
  // Add other networks when you deploy to them
  [base.id]: {
    // Production addresses would go here
    Paynest: undefined, // Not yet deployed
    MockUSDT: undefined,
    AddressRegistry: undefined,
  },
};
