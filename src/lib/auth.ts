import { convexBetterAuthReactStart } from "@convex-dev/better-auth/react-start";

// Proxy functions that execute HTTP requests from TanStack start to Convex
export const { handler, getToken, fetchAuthQuery, fetchAuthMutation, fetchAuthAction } = convexBetterAuthReactStart({
  convexUrl: process.env.VITE_CONVEX_URL!,
  convexSiteUrl: process.env.VITE_CONVEX_SITE_URL || (process.env.VITE_CONVEX_URL || "").replace(".cloud", ".site"),
});

// Since some previous routes might import `auth` as `betterAuth`, I'll expose it here
// Though we should ideally use authClient, but the API endpoint uses `auth.handler`
export const auth = { handler };
