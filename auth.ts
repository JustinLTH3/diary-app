import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { verifyCredentials } from "@/lib/auth/verifyCredentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!hasCredentialStrings(credentials)) {
          return null;
        }

        return verifyCredentials(credentials.username, credentials.password);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }

      return session;
    },
  },
};

function hasCredentialStrings(
  credentials: Record<string, unknown> | undefined,
): credentials is { username: string; password: string } {
  return typeof credentials?.username === "string" && typeof credentials.password === "string";
}
