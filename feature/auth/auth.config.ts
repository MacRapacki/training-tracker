import type { NextAuthConfig } from "next-auth";

// Edge-safe config — bez importów Node.js (bez Prismy, bez pg)
// Używany przez middleware do weryfikacji JWT
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (!isLoggedIn && !isAuthPage) return false;
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
};
