import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="w-full border-b border-border  p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-mtext">Paynest Example</h1>
        <Button variant="neutral">Connect Wallet</Button>
      </div>
    </nav>
  );
}
