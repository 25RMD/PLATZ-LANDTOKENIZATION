import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyJwt } from "./authUtils";
import prisma from "./prisma";

/**
 * Configuration for NextAuth.js v5 used to configure adapters, providers, callbacks, etc.
 * This bridges the custom JWT authentication with NextAuth for API routes.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        
        // Verify the JWT token using the existing verifyJwt function
        const payload = await verifyJwt(credentials.token as string);
        if (!payload) return null;
        
        // Fetch the user from the database
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            username: true,
            email: true,
            isAdmin: true
          }
        });
        
        if (!user) return null;
        
        return {
          id: user.id,
          name: user.username || undefined,
          email: user.email || undefined,
          isAdmin: user.isAdmin || false
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.JWT_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper function to check if a user is an admin in API routes
export async function isAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);
  const payload = await verifyJwt(token);
  
  return payload?.isAdmin === true;
}
