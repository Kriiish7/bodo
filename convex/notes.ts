import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getNote = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) throw new Error("Note not found");
    return note;
  },
});

export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notes").withIndex("by_updated").order("desc").take(50);
  },
});

export const createNote = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", {
      title: args.title,
      content: "",
      updatedAt: Date.now(),
    });
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});
