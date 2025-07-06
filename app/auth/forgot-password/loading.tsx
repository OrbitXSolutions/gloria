import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <Spinner size="large" className="text-primary mb-4" />
      <h2 className="text-2xl font-semibold text-primary-foreground">
        Loading...
      </h2>
      <p className="mt-2 text-secondary-foreground max-w-sm text-center">
        Preparing your experience, just a moment…
      </p>
    </div>
  );
}
