"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import MockUSDTAbi from "@/lib/abis/MockUSDT";
import { CONTRACT_ADDRESSES } from "@/lib/config/networks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TokenBalance() {
  const { toast } = useToast();
  const { address, chainId } = useAccount();
  const [mintAmount] = useState(100); // Default mint amount of 100 USDT

  // Get contract address from config
  const mockUsdtAddress = chainId
    ? CONTRACT_ADDRESSES[chainId]?.MockUSDT
    : undefined;

  // Read balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: mockUsdtAddress as `0x${string}`,
    abi: MockUSDTAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!mockUsdtAddress,
    },
  });

  // Get token decimals
  const { data: decimals } = useReadContract({
    address: mockUsdtAddress as `0x${string}`,
    abi: MockUSDTAbi,
    functionName: "decimals",
    query: {
      enabled: !!mockUsdtAddress,
    },
  });

  // Setup mint transaction
  const { data: hash, writeContract, isPending } = useWriteContract();

  // Track transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle mint button click
  const handleMint = async () => {
    if (!address || !mockUsdtAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const dec = decimals || 6; // Default to 6 if not available
      const amount = parseUnits(mintAmount.toString(), dec);

      writeContract({
        address: mockUsdtAddress,
        abi: MockUSDTAbi,
        functionName: "mint",
        args: [address, amount],
      });
    } catch (error) {
      toast({
        title: "Failed to mint tokens",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Refetch the balance after successful mint
  if (isConfirmed) {
    refetchBalance();
  }

  // Format the balance for display
  const formattedBalance =
    balance && decimals ? formatUnits(balance, decimals) : "0";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>USDT Balance</CardTitle>
        <CardDescription>
          Your current USDT balance and mint options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Current Balance</p>
            <div className="text-3xl font-bold">{formattedBalance} USDT</div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Mint {mintAmount} USDT tokens to your wallet
            </p>
            <Button
              className="w-full"
              onClick={handleMint}
              disabled={isPending || isConfirming || !address}
            >
              {isPending || isConfirming ? "Minting..." : "Mint USDT"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
