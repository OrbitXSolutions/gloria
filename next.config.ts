import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { SupabasePaths } from "./lib/constants/supabase-storage";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "*.app.github.dev",
        "*.githubpreview.dev",
        "cautious-waddle-jq7rjr97gv435rg6-3000.app.github.dev",
        "cautious-waddle-jq7rjr97gv435rg6-3001.app.github.dev",
      ],
    },
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      new URL(`${SupabasePaths.IMAGES}/**`),
      new URL(`https://lh3.googleusercontent.com/**`),
      new URL(`https://avatars.githubusercontent.com/**`),
    ],
  },
};

// export default nextConfig;
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);