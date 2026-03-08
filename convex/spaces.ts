import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: { name: v.string(), ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.insert("spaces", {
      name: args.name,
      ownerId: args.ownerId,
      createdAt: Date.now(),
    });
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("spaces")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, args) => {
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    for (const board of boards) {
      // Remove space association (or we could delete boards too)
      await ctx.db.patch(board._id, { spaceId: undefined });
    }

    await ctx.db.delete(args.spaceId);
  },
});
