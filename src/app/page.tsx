import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ConnectedWallets } from "@/components/ConnectedWallets";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto p-4">
        <div className="space-y-8">
          <ConnectedWallets />
          <Button>Click me</Button>
        </div>
      </main>
    </div>
  );
}
