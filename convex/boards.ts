import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: { title: v.string(), ownerId: v.id("users"), isPublic: v.boolean() },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("boards", {
      title: args.title,
      ownerId: args.ownerId,
      isPublic: args.isPublic,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const get = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.boardId);
  },
});

export const listForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .order("desc")
      .collect();
  },
});

export const remove = mutation({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    // Delete all elements for this board first.
    const elements = await ctx.db
      .query("elements")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();

    for (const el of elements) {
      await ctx.db.delete(el._id);
    }

    await ctx.db.delete(args.boardId);
  },
});

export const update = mutation({
  args: { boardId: v.id("boards"), title: v.string(), isPublic: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const { boardId, title, isPublic } = args;
    await ctx.db.patch(boardId, {
      title,
      isPublic: isPublic !== undefined ? isPublic : undefined,
      updatedAt: Date.now(),
    });
  },
});
