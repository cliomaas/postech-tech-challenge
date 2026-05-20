import { hashPassword } from "@/lib/infra/auth/passwordHash";

export const runtime = "nodejs";

type UserRecord = { id: string; email: string; passwordHash?: string; name?: string };

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const registerErrorMessage = "Nao foi possivel cadastrar. Tente novamente.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "").trim();

  if (!email || !password || password.length < 4) {
    return Response.json({ error: "Dados invalidos." }, { status: 400 });
  }

  try {
    const check = await fetch(`${BASE}/users?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (!check.ok) {
      console.error("Register user lookup failed", {
        status: check.status,
        statusText: check.statusText,
        baseUrl: BASE,
      });
      return Response.json({ error: registerErrorMessage }, { status: 502 });
    }

    if (check.ok) {
      const existing = (await check.json()) as UserRecord[];
      if (existing.length > 0) {
        return Response.json({ error: "Email ja cadastrado." }, { status: 409 });
      }
    }

    const create = await fetch(`${BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `u-${Date.now()}`,
        email,
        passwordHash: await hashPassword(password),
        ...(name ? { name } : {}),
      }),
    });

    if (!create.ok) {
      console.error("Register user creation failed", {
        status: create.status,
        statusText: create.statusText,
        baseUrl: BASE,
      });
      return Response.json({ error: registerErrorMessage }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Register request failed", { error, baseUrl: BASE });
    return Response.json({ error: registerErrorMessage }, { status: 503 });
  }
}
