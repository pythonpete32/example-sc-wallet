"use client";

import { useWallets, type ConnectedWallet } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const explanation =
  "With Privy, users may have multiple wallets connected to your app, but wagmi’s React hooks return information for only one connected wallet at a time. This is referred to as the active wallet.";

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatWalletType(type: string) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function ConnectedWallets() {
  const { wallets } = useWallets();

  // Filter out duplicate addresses
  const uniqueWallets = wallets.filter((wallet, index) => {
    return wallets.findIndex((w) => w.address === wallet.address) === index;
  });

  // Find the active wallet (it's the first one in the list, if any wallets exist)
  const activeWallet = wallets.length > 0 ? wallets[0] : null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connected Wallets</CardTitle>
        <CardDescription>
          {uniqueWallets.length === 0 ? "No wallets connected" : explanation}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uniqueWallets.map((wallet: ConnectedWallet) => {
            const isActive = wallet.address === activeWallet?.address;
            return (
              <div
                key={`${wallet.address}-${wallet.walletClientType}`}
                className={`flex items-center p-3 border rounded-lg ${
                  isActive ? "bg-primary/10 border-primary" : "bg-secondary/10"
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm truncate">
                      {truncateAddress(wallet.address)}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant="default">Connected</Badge>
                      {isActive && (
                        <Badge variant="default" className="bg-primary">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatWalletType(wallet.walletClientType)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
