import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByBoardId = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("elements")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
  },
});

export const add = mutation({
  args: {
    boardId: v.id("boards"),
    type: v.union(
      v.literal("path"),
      v.literal("highlight"),
      v.literal("rectangle"),
      v.literal("ellipse"),
      v.literal("text"),
      v.literal("sticky"),
      v.literal("diamond"),
      v.literal("arrow"),
      v.literal("line"),
      v.literal("image")
    ),
    x: v.number(),
    y: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fill: v.optional(v.string()),
    stroke: v.optional(v.string()),
    strokeWidth: v.optional(v.number()),
    points: v.optional(v.array(v.number())),
    text: v.optional(v.string()),
    layer: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("elements", args);
  },
});

export const update = mutation({
  args: {
    elementId: v.id("elements"),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    fill: v.optional(v.string()),
    stroke: v.optional(v.string()),
    strokeWidth: v.optional(v.number()),
    text: v.optional(v.string()),
    points: v.optional(v.array(v.number())),
    layer: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { elementId, ...rest } = args;
    await ctx.db.patch(elementId, rest);
  },
});

export const remove = mutation({
  args: { elementId: v.id("elements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.elementId);
  },
});

export const addMany = mutation({
  args: {
    elements: v.array(
      v.object({
        boardId: v.id("boards"),
        type: v.union(
          v.literal("path"),
          v.literal("highlight"),
          v.literal("rectangle"),
          v.literal("ellipse"),
          v.literal("text"),
          v.literal("sticky"),
          v.literal("diamond"),
          v.literal("arrow"),
          v.literal("line"),
          v.literal("image")
        ),
        x: v.number(),
        y: v.number(),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        fill: v.optional(v.string()),
        stroke: v.optional(v.string()),
        strokeWidth: v.optional(v.number()),
        points: v.optional(v.array(v.number())),
        text: v.optional(v.string()),
        layer: v.number(),
      })
    )
  },
  handler: async (ctx, args) => {
    for (const el of args.elements) {
      await ctx.db.insert("elements", el);
    }
  }
});

export const removeMany = mutation({
  args: {
    elementIds: v.array(v.id("elements"))
  },
  handler: async (ctx, args) => {
    for (const _id of args.elementIds) {
      await ctx.db.delete(_id);
    }
  }
});
