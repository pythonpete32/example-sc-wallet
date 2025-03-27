"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
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
import { useWallets, ConnectedWallet } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { baseSepolia } from "wagmi/chains";

export function TokenBalance() {
  const { toast } = useToast();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();
  const chainId = useChainId();
  const [mintAmount] = useState(100); // Default mint amount of 100 USDT
  const [isSettingActiveWallet, setIsSettingActiveWallet] = useState(false);
  const [walletDebugInfo, setWalletDebugInfo] = useState<string[]>([]);

  // Check if we're on the correct network
  const isCorrectNetwork = chainId === baseSepolia.id;

  // Get contract address from config
  const mockUsdtAddress = chainId
    ? CONTRACT_ADDRESSES[chainId]?.MockUSDT
    : undefined;

  // Debug function to log wallet information
  const debugWallets = useCallback(() => {
    const info: string[] = [];

    info.push(`Active address: ${address || "none"}`);
    info.push(`Connected wallets: ${wallets.length}`);
    info.push(
      `Current chain: ${chainId ? (chainId === baseSepolia.id ? "Base Sepolia" : chainId) : "unknown"}`
    );
    info.push(`Expected chain: ${baseSepolia.name} (${baseSepolia.id})`);
    info.push(`Contract address: ${mockUsdtAddress || "unknown"}`);

    wallets.forEach((wallet, i) => {
      info.push(
        `Wallet ${i + 1}: ${wallet.address} (${wallet.walletClientType})`
      );
    });

    // Try to identify which one is the smart contract wallet
    const potentialSmartWallets = wallets.filter(
      (w) =>
        w.walletClientType === "smart_contract" ||
        w.walletClientType === "privy" ||
        (typeof w.walletClientType === "string" &&
          w.walletClientType.includes("smart"))
    );

    if (potentialSmartWallets.length > 0) {
      info.push(
        `Potential smart contract wallets found: ${potentialSmartWallets.length}`
      );
      potentialSmartWallets.forEach((w, i) => {
        info.push(
          `  Smart wallet ${i + 1}: ${w.address} (${w.walletClientType})`
        );
      });
    } else {
      info.push("No smart contract wallets found");
    }

    console.log("WALLET DEBUG INFO:", info.join("\n"));
    setWalletDebugInfo(info);
  }, [address, wallets, chainId, mockUsdtAddress]);

  // Find the embedded wallet (likely to be the smart contract wallet)
  const findSmartContractWallet = useCallback(() => {
    // First try explicit smart_contract type
    let scWallet = wallets.find((w) => w.walletClientType === "smart_contract");

    // If not found, try privy type (which is often the smart contract wallet)
    if (!scWallet) {
      scWallet = wallets.find((w) => w.walletClientType === "privy");
    }

    // Still not found, try any wallet that includes "smart" in the type
    if (!scWallet) {
      scWallet = wallets.find(
        (w) =>
          typeof w.walletClientType === "string" &&
          (String(w.walletClientType).toLowerCase().includes("smart") ||
            String(w.walletClientType).toLowerCase().includes("contract"))
      );
    }

    // If we have at least one wallet and no better option, use the first embedded wallet
    if (!scWallet && wallets.length > 0) {
      const embeddedWallet = wallets.find(
        (w) =>
          w.walletClientType !== "metamask" &&
          w.walletClientType !== "injected" &&
          w.walletClientType !== "walletconnect"
      );

      if (embeddedWallet) {
        console.log(
          "Using embedded wallet as fallback for gasless transactions"
        );
        return embeddedWallet;
      }
    }

    // In a very last resort, if we have multiple wallets, just pick the one that's not currently active
    if (!scWallet && wallets.length > 1 && address) {
      const differentWallet = wallets.find((w) => w.address !== address);
      if (differentWallet) {
        console.log(
          "Last resort: Using non-active wallet:",
          differentWallet.address
        );
        return differentWallet;
      }
    }

    return scWallet;
  }, [wallets, address]);

  const smartContractWallet = findSmartContractWallet();

  // Debug on component mount and when wallets change
  useEffect(() => {
    debugWallets();
  }, [debugWallets]);

  // Network warning if not on Base Sepolia
  useEffect(() => {
    if (chainId && chainId !== baseSepolia.id) {
      toast({
        title: "Wrong Network",
        description: `Please switch to ${baseSepolia.name} (Chain ID: ${baseSepolia.id})`,
        variant: "destructive",
      });
    }
  }, [chainId, toast]);

  // This sets the smart contract wallet as the active wallet when available
  useEffect(() => {
    const activateSmartContractWallet = async () => {
      if (!smartContractWallet || isSettingActiveWallet) return;

      // Check if the smart contract wallet is already active
      if (address === smartContractWallet.address) {
        console.log("Smart contract wallet is already active:", address);
        return;
      }

      try {
        setIsSettingActiveWallet(true);
        console.log(
          "Setting smart contract wallet as active for gasless transactions:",
          smartContractWallet.address,
          "Current active:",
          address
        );
        await setActiveWallet(smartContractWallet);
        console.log("Successfully set smart contract wallet as active");
        toast({
          title: "Smart Contract Wallet Activated",
          description:
            "Now using smart contract wallet for gasless transactions",
        });
      } catch (error) {
        console.error("Failed to set smart contract wallet as active:", error);
        toast({
          title: "Wallet Activation Failed",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setIsSettingActiveWallet(false);
      }
    };

    if (wallets.length > 0 && smartContractWallet) {
      console.log("Attempting to activate smart contract wallet");
      activateSmartContractWallet();
    } else if (wallets.length > 0 && !smartContractWallet) {
      console.log("No smart contract wallet found among connected wallets");
    }
  }, [
    wallets,
    address,
    smartContractWallet,
    setActiveWallet,
    toast,
    isSettingActiveWallet,
  ]);

  // Explicitly force wallet activation
  const forceActivateSmartWallet = async () => {
    if (!smartContractWallet) {
      toast({
        title: "No Smart Contract Wallet",
        description:
          "No smart contract wallet is available for gasless transactions",
        variant: "destructive",
      });
      return;
    }

    if (isSettingActiveWallet) return;

    try {
      setIsSettingActiveWallet(true);
      toast({
        title: "Switching to Smart Contract Wallet",
        description: "Setting your smart contract wallet as active...",
      });

      console.log(
        "Forcing smart contract wallet activation:",
        smartContractWallet.address
      );
      await setActiveWallet(smartContractWallet);

      toast({
        title: "Smart Contract Wallet Activated",
        description: "Successfully switched to your smart contract wallet",
      });
    } catch (error) {
      console.error("Failed to force activate smart wallet:", error);
      toast({
        title: "Wallet Switch Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSettingActiveWallet(false);
    }
  };

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
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  // Track transaction status
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Handle mint button click
  const handleMint = async () => {
    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: `Please switch to ${baseSepolia.name} (Chain ID: ${baseSepolia.id})`,
        variant: "destructive",
      });
      return;
    }

    if (!address || !mockUsdtAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    // If smart contract wallet exists but not active, force activate it first
    if (smartContractWallet && address !== smartContractWallet.address) {
      await forceActivateSmartWallet();
      // Return early to prevent the transaction - next click will use the smart wallet
      toast({
        title: "Please click mint again",
        description:
          "Now that your smart contract wallet is active, please click mint again",
      });
      return;
    }

    try {
      const dec = decimals || 6; // Default to 6 if not available
      const amount = parseUnits(mintAmount.toString(), dec);

      console.log("Initiating mint transaction with address:", address);
      console.log(
        "Using smart contract wallet for gasless transaction:",
        isUsingSmartWallet
      );

      // Attempt to use gasless transaction via Privy's paymaster
      if (isUsingSmartWallet) {
        console.log("Attempting gasless transaction with paymaster");
      }

      // Execute the transaction
      writeContract({
        address: mockUsdtAddress,
        abi: MockUSDTAbi,
        functionName: "mint" as const, // Use const assertion to fix type error
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

  // Display errors from the write contract
  useEffect(() => {
    if (writeError) {
      console.error("Transaction error:", writeError);
      toast({
        title: "Transaction Failed",
        description: writeError.message,
        variant: "destructive",
      });
    }
  }, [writeError, toast]);

  // Refetch the balance after successful mint
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      toast({
        title: "Tokens Minted",
        description: `Successfully minted ${mintAmount} USDT tokens`,
      });
    }
  }, [isConfirmed, refetchBalance, mintAmount, toast]);

  // Format the balance for display
  const formattedBalance =
    balance && decimals ? formatUnits(balance, decimals) : "0";

  // Check if using the smart contract wallet
  const isUsingSmartWallet =
    smartContractWallet && address === smartContractWallet.address;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>USDT Balance</CardTitle>
        <CardDescription>
          {!isCorrectNetwork ? (
            <span className="text-red-500">
              Please switch to Base Sepolia network
            </span>
          ) : isUsingSmartWallet ? (
            "Using smart contract wallet for gasless transactions"
          ) : smartContractWallet ? (
            "Click Mint to switch to smart contract wallet for gasless transactions"
          ) : (
            "No smart contract wallet available"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-1">Current Balance</p>
            <div className="text-3xl font-bold">{formattedBalance} USDT</div>
            {address && (
              <p className="text-xs text-muted-foreground mt-2">
                Active Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                {isUsingSmartWallet ? " (Smart Contract)" : " (EOA)"}
              </p>
            )}
            {!isCorrectNetwork && chainId && (
              <p className="text-xs text-red-500 mt-1">
                Connected to wrong network:{" "}
                {chainId === baseSepolia.id ? "Base Sepolia" : chainId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Mint {mintAmount} USDT tokens{" "}
              {isUsingSmartWallet ? "(gasless transaction)" : ""}
            </p>
            <Button
              className="w-full"
              onClick={handleMint}
              disabled={
                isPending ||
                isConfirming ||
                !address ||
                isSettingActiveWallet ||
                !isCorrectNetwork
              }
            >
              {isPending || isConfirming
                ? "Minting..."
                : isSettingActiveWallet
                  ? "Switching Wallet..."
                  : !isCorrectNetwork
                    ? "Switch to Base Sepolia"
                    : smartContractWallet && !isUsingSmartWallet
                      ? "Switch to Smart Wallet & Mint"
                      : "Mint USDT"}
            </Button>
          </div>

          {/* Add a separate button to explicitly switch to smart wallet */}
          {smartContractWallet && !isUsingSmartWallet && isCorrectNetwork && (
            <Button
              variant="default"
              className="w-full"
              onClick={forceActivateSmartWallet}
              disabled={isSettingActiveWallet}
            >
              Switch to Smart Contract Wallet
            </Button>
          )}

          {/* Debug info */}
          {walletDebugInfo.length > 0 && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono">
              <p className="font-bold">Debug Info:</p>
              {walletDebugInfo.map((line, index) => (
                <div
                  // Using a unique string + index to satisfy the linter
                  key={`debug-line-${line.substring(0, 10)}-${index}`}
                  className="whitespace-pre-wrap"
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
