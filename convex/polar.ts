import { action, httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Polar } from "@polar-sh/sdk";
import { WebhookVerificationError, validateEvent } from "@polar-sh/sdk/webhooks";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
});

export const createCheckoutSession = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to polar");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("No email found for user");
    }

    const user = await ctx.runQuery(internal.users.getUserByEmailInternal, { email });
    if (!user) {
      throw new Error("User not found in Convex");
    }

    const domain = process.env.SITE_URL || "http://localhost:3000";

    const response = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID || "product_example"],
      successUrl: `${domain}/dashboard?success=true`,
      customerEmail: user.email,
      metadata: {
        userId: user._id,
      },
    });

    // Handle both straight object returns and Result pattern just in case
    const checkout = (response as any).ok ? (response as any).value : response;

    if (!checkout || !checkout.url) {
      throw new Error("Failed to create checkout session");
    }

    return checkout.url as string;
  },
});

export const webhook = httpAction(async (ctx, request) => {
  const payload = await request.text();
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });

  let event;
  try {
    event = validateEvent(
      payload,
      headersObj as any,
      process.env.POLAR_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    if (err instanceof WebhookVerificationError) {
      return new Response(`Webhook Verification Error: ${err.message}`, { status: 403 });
    }
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.created") {
    // Note: In Polar, checkout.created usually doesn't mean it's paid.
    // However, subscription.created or subscription.updated is better for payments.
  }

  if (event.type === "subscription.created" || event.type === "subscription.updated") {
    const subscription = event.data;
    const isPro = subscription.status === "active";
    const userId = subscription.metadata?.userId;
    
    if (userId) {
      await ctx.runMutation(internal.users.updateSubscription, {
        userId: userId as any,
        polarSubscriptionId: subscription.id,
        polarCustomerId: subscription.customerId,
        isPro,
      });
    } else {
      await ctx.runMutation(internal.users.updateSubscriptionByPolarId, {
        polarSubscriptionId: subscription.id,
        isPro,
      });
    }
  }

  if (event.type === "subscription.revoked") {
    const subscription = event.data;
    await ctx.runMutation(internal.users.updateSubscriptionByPolarId, {
      polarSubscriptionId: subscription.id,
      isPro: false,
    });
  }

  return new Response("OK", { status: 200 });
});
