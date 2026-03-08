import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    isPro: v.optional(v.boolean()),
    polarSubscriptionId: v.optional(v.string()),
    polarCustomerId: v.optional(v.string()),
  }).index("by_email", ["email"]).index("by_authId", ["authId"]).index("by_polar_subscription", ["polarSubscriptionId"]),
  spaces: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    createdAt: v.optional(v.number()),
  }).index("by_owner", ["ownerId"]),
  boards: defineTable({
    title: v.string(),
    ownerId: v.id("users"),
    spaceId: v.optional(v.id("spaces")),
    isPublic: v.boolean(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_owner", ["ownerId"]).index("by_space", ["spaceId"]),
  elements: defineTable({
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
  }).index("by_board", ["boardId"]),
});
