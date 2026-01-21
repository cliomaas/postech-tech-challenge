type UserRecord = { id: string; email: string; password: string; name?: string };

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
        password,
        ...(name ? { name } : {}),
      }),
    });

    if (!create.ok) {
      return Response.json({ error: "Erro ao cadastrar." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Erro ao cadastrar." }, { status: 500 });
  }
}
