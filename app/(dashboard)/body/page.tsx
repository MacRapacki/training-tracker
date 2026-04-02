import { Scale } from "lucide-react";

export default function BodyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-xl font-bold tracking-tight md:text-2xl">
        Body
      </h1>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <Scale className="mb-4 size-10 text-muted-foreground/40" />
        <p className="font-medium">Coming soon</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Body weight and water intake tracking will appear here
        </p>
      </div>
    </div>
  );
}
