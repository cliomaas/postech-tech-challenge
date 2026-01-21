import { withAuth } from "next-auth/middleware";

const isDev = process.env.NODE_ENV === "development";
const devSecret = "dev-secret-local";
const devUrl = "http://localhost:3000";

if (isDev) {
  process.env.NEXTAUTH_SECRET ??= devSecret;
  process.env.NEXTAUTH_URL ??= devUrl;
}

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*"],
};
