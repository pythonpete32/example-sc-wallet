import type { PrivyClientConfig } from "@privy-io/react-auth";
import { baseSepolia } from "wagmi/chains";

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "all-users",
    requireUserPasswordOnCreate: true,
    showWalletUIs: true,
  },
  loginMethods: ["wallet", "email"],
  appearance: {
    showWalletLoginFirst: true,
  },
  supportedChains: [
    {
      id: baseSepolia.id,
      name: baseSepolia.name,
      rpcUrls: {
        default: {
          http: [baseSepolia.rpcUrls.default.http[0]],
        },
      },
      blockExplorers: baseSepolia.blockExplorers,
      nativeCurrency: baseSepolia.nativeCurrency,
    },
  ],
  defaultChain: {
    id: baseSepolia.id,
    name: baseSepolia.name,
    rpcUrls: {
      default: {
        http: [baseSepolia.rpcUrls.default.http[0]],
      },
    },
    blockExplorers: baseSepolia.blockExplorers,
    nativeCurrency: baseSepolia.nativeCurrency,
  },
};
