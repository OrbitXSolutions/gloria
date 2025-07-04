import { Suspense } from "react";
import WelcomeClient from "./welcome-client";
import { Skeleton } from "@/components/ui/skeleton";

function WelcomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="flex min-h-screen">
        {/* Left side - Image skeleton */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Right side - Content skeleton */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<WelcomeLoading />}>
      <WelcomeClient />
    </Suspense>
  );
}
