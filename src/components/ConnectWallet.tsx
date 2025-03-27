"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { usePrivy } from "@privy-io/react-auth";

import { Button } from "./ui/button";

export function ConnectWallet() {
  const { login, ready, authenticated, user, logout } = usePrivy();

  if (!ready) {
    return (
      <Button variant="neutral" disabled>
        Loading...
      </Button>
    );
  }

  if (authenticated && user) {
    return (
      <Button variant="neutral" onClick={logout} className="gap-2">
        <WalletIcon className="size-4" />
        {user.wallet?.address?.slice(0, 6)}...{user.wallet?.address?.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={login} className="gap-2">
      <WalletIcon className="size-4" />
      Connect Wallet
    </Button>
  );
}
