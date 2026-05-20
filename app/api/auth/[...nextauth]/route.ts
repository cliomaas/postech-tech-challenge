import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/infra/auth/passwordHash";

export const runtime = "nodejs";

type UserRecord = { id: string; email: string; passwordHash?: string; name?: string };

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    const res = await fetch(`${BASE}/users?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as UserRecord[];
    return data[0] ?? null;
  } catch {
    return null;
  }
}

const isDev = process.env.NODE_ENV === "development";
const devSecret = "dev-secret-local";
const devUrl = "http://localhost:3000";

if (isDev) {
  process.env.NEXTAUTH_SECRET ??= devSecret;
  process.env.NEXTAUTH_URL ??= devUrl;
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const allowedPasswordHash =
          process.env.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD ?? "";

        if (!email || !password) return null;
        if (allowedEmail && allowedPasswordHash && email === allowedEmail) {
          const validAdminPassword = await verifyPassword(password, allowedPasswordHash).catch(() => false);
          if (validAdminPassword) {
            return { id: "admin", email, name: "Admin" };
          }
        }

        const user = await fetchUserByEmail(email);
        if (!user?.passwordHash) return null;

        const validPassword = await verifyPassword(password, user.passwordHash).catch(() => false);
        if (!validPassword) return null;

        return { id: user.id, email: user.email, name: user.name ?? "Usuario" };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
