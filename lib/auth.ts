import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyJwt } from "./authUtils";
import prisma from "./prisma";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 * This bridges the custom JWT authentication with NextAuth for API routes.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        
        // Verify the JWT token using the existing verifyJwt function
        const payload = await verifyJwt(credentials.token);
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
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          isAdmin: token.isAdmin
        };
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
