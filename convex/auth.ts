import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { WorkOS } from "@workos-inc/node";

function getWorkOS() {
  return new WorkOS(process.env.WORKOS_API_KEY!);
}

const clientId = process.env.WORKOS_CLIENT_ID!;
const redirectUri = process.env.WORKOS_REDIRECT_URI!;

export const getSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", identity.subject))
      .first();
    
    if (!user) {
      return null;
    }
    
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        image: user.avatarUrl,
      },
    };
  },
});

export const signInWithPassword = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    try {
      const workos = getWorkOS();
      const result = await workos.userManagement.authenticateWithPassword({
        email: args.email,
        password: args.password,
        clientId,
      });
      
      const user = await ctx.db
        .query("users")
        .withIndex("by_authId", (q) => q.eq("authId", result.user.id))
        .first();
      
      if (!user) {
        await ctx.db.insert("users", {
          authId: result.user.id,
          email: result.user.email ?? "",
          name: `${result.user.firstName ?? ""} ${result.user.lastName ?? ""}`.trim(),
          avatarUrl: result.user.profilePictureUrl ?? undefined,
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Invalid credentials" };
    }
  },
});

export const signUp = mutation({
  args: { email: v.string(), password: v.string(), firstName: v.string(), lastName: v.string() },
  handler: async (ctx, args) => {
    try {
      const workos = getWorkOS();
      const user = await workos.userManagement.createUser({
        email: args.email,
        password: args.password,
        firstName: args.firstName,
        lastName: args.lastName,
        emailVerified: true,
      });
      
      await ctx.db.insert("users", {
        authId: user.id,
        email: user.email ?? "",
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        avatarUrl: user.profilePictureUrl ?? undefined,
      });
      
      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "Failed to create user" };
    }
  },
});

export const signOut = mutation({
  args: {},
  handler: async () => {
    return { success: true };
  },
});

export const getAuthUrl = mutation({
  args: {},
  handler: async () => {
    const workos = getWorkOS();
    const authUrl = await workos.userManagement.getAuthorizationUrl({
      clientId,
      redirectUri,
      provider: "authkit",
    });
    return authUrl;
  },
});

export const authenticateWithCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    try {
      const workos = getWorkOS();
      const result = await workos.userManagement.authenticateWithCode({
        code: args.code,
        clientId,
      });
      
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_authId", (q) => q.eq("authId", result.user.id))
        .first();
      
      if (!existingUser) {
        await ctx.db.insert("users", {
          authId: result.user.id,
          email: result.user.email ?? "",
          name: `${result.user.firstName ?? ""} ${result.user.lastName ?? ""}`.trim(),
          avatarUrl: result.user.profilePictureUrl ?? undefined,
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error("Auth error:", error);
      return { success: false, error: "Authentication failed" };
    }
  },
});
