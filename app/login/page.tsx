"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Card from "@/components/ds/Card";
import Input from "@/components/ds/Input";
import Button from "@/components/ds/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha invalidos.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-fg mb-2">Entrar</h1>
        <p className="text-sm text-muted mb-6">Use seu email e senha cadastrados.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Não tem conta?{" "}
          <a href="/register" className="text-[color:var(--color-brand)] hover:underline">
            Criar conta
          </a>
        </p>
      </Card>
    </div>
  );
}
