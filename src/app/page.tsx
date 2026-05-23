import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        EventSphere
      </h1>
      <p className="max-w-md text-muted-foreground">
        AI-native event operating system for communities, hackathons, and
        creators.
      </p>
      <Button size="lg">Get Started</Button>
    </main>
  );
}
