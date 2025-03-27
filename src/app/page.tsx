import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ConnectedWallets } from "@/components/ConnectedWallets";
import { TokenBalance } from "@/components/TokenBalance";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto p-4">
        <div className="space-y-8">
          <ConnectedWallets />
          <TokenBalance />
          <Button>Click me</Button>
        </div>
      </main>
    </div>
  );
}
