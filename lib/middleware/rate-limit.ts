// lib/middleware/rate-limit.ts
import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window

export const rateLimitMiddleware = async () => {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  // Clean up expired entries
  if (userLimit && now > userLimit.resetTime) {
    rateLimitStore.delete(ip);
  }

  const currentUserLimit = rateLimitStore.get(ip);

  if (!currentUserLimit) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return;
  }

  if (currentUserLimit.count >= MAX_REQUESTS) {
    throw new Error(
      `Too many requests. Please try again in ${Math.ceil(
        (currentUserLimit.resetTime - now) / 60000
      )} minutes.`
    );
  }

  currentUserLimit.count++;
};

// Create action client with rate limiting
export const actionClientWithRateLimit = createSafeActionClient().use(
  ({ next }) => {
    rateLimitMiddleware();
    return next();
  }
);
// Update your contact action to use this client:
// export const sendContactEmail = actionClientWithRateLimit
//   .schema(contactFormSchema)
//   .action(async ({ parsedInput }) => {
//     // ... your existing action code
//   });
