import type { PrivyClientConfig } from '@privy-io/react-auth'

export const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
        createOnLogin: 'all-users',
        requireUserPasswordOnCreate: true,
        showWalletUIs: true,
    },
    loginMethods: ['wallet', 'email'],
    appearance: {
        showWalletLoginFirst: true,
    },
}
