import type { NextAuthConfig } from "next-auth";
import { routes } from "@/lib/routes";

// Edge-safe config — bez importów Node.js (bez Prismy, bez pg)
// Używany przez middleware do weryfikacji JWT
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
