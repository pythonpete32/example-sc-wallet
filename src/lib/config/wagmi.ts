import { createConfig } from '@privy-io/wagmi'
import { cookieStorage, createStorage, http } from 'wagmi'
import { baseSepolia, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

export function getConfig() {
    return createConfig({
        chains: [sepolia, baseSepolia],
        connectors: [injected(), coinbaseWallet()],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [sepolia.id]: http(),
            [baseSepolia.id]: http(),
        },
    })
}

declare module 'wagmi' {
    interface Register {
        config: ReturnType<typeof getConfig>
    }
}
