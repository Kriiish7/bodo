import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const ensureUser = mutation({
  args: { name: v.string(), email: v.string(), avatarUrl: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      if (existing.name !== args.name || existing.avatarUrl !== args.avatarUrl) {
        await ctx.db.patch(existing._id, {
          name: args.name,
          avatarUrl: args.avatarUrl,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      avatarUrl: args.avatarUrl,
    });
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const getUserByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

export const updateSubscription = internalMutation({
  args: { 
    userId: v.id("users"), 
    polarSubscriptionId: v.string(), 
    polarCustomerId: v.string(),
    isPro: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      polarSubscriptionId: args.polarSubscriptionId,
      polarCustomerId: args.polarCustomerId,
      isPro: args.isPro,
    });
  },
});

export const updateSubscriptionByPolarId = internalMutation({
  args: {
    polarSubscriptionId: v.string(),
    isPro: v.boolean()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_polar_subscription", q => 
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();
    
    if (user) {
      await ctx.db.patch(user._id, { isPro: args.isPro });
    }
  }
});
