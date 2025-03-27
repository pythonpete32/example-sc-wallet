import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto p-4">
        <Button>Click me</Button>
      </main>
    </div>
  );
}
