import { query, mutation } from "./_generated/server";

export const getSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .first();
      
    return {
      user: {
        id: user?._id || identity.subject,
        email: identity.email || "",
        name: identity.name || "",
        image: identity.pictureUrl || user?.avatarUrl,
      },
      dbUser: user
    };
  },
});

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    let user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .first();
      
    if (!user) {
      const userId = await ctx.db.insert("users", {
        authId: identity.subject,
        email: identity.email || "",
        name: identity.name || "User",
        avatarUrl: identity.pictureUrl,
      });
      user = await ctx.db.get(userId);
    } else if (user.name === "User" && identity.name) {
      // Update name if we just had placeholder
      await ctx.db.patch(user._id, {
        name: identity.name,
        avatarUrl: identity.pictureUrl || user.avatarUrl,
      });
    }
    
    return user;
  }
});
