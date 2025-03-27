"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { privyConfig } from "@/lib/config/privy";
import { getConfig } from "@/lib/config/wagmi";

import type { State } from "wagmi";
import { Toaster } from "@/components/ui/toaster";

// Replace this with your Privy config

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider appId="cm8mzzgtc007r12v9fvyhgnar" config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config} initialState={props.initialState}>
          {props.children}
          <Toaster />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
