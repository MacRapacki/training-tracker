import type { NextAuthConfig } from "next-auth";
import { routes } from "@/lib/routes";

// Edge-safe config — no Node.js imports (no Prisma, no pg)
// Used by middleware to verify JWT
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [],
  pages: {
    signIn: routes.login,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith(routes.login) ||
        nextUrl.pathname.startsWith(routes.register);

      if (!isLoggedIn && !isAuthPage) return false;
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL(routes.dashboard, nextUrl));
      }
      return true;
    },
  },
};
