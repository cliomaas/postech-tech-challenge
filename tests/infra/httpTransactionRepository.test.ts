import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyTransaction } from "@/lib/domain/transactions";

const transaction: AnyTransaction = {
  id: "tx-1",
  amount: 100,
  date: "2026-05-20",
  type: "deposit",
  description: "Salario",
  status: "PROCESSED",
  category: "INCOME",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("HttpTransactionRepository cache", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "http://api.test";
  });

  it("caches transaction lists and returns cloned data", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse([transaction]));
    vi.stubGlobal("fetch", fetchMock);

    const { HttpTransactionRepository } = await import(
      "@/lib/infra/transactions/httpTransactionRepository"
    );
    const repository = new HttpTransactionRepository();

    const first = await repository.list();
    const second = await repository.list();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/transactions?", {
      cache: "no-store",
      signal: undefined,
    });
    expect(second).toEqual(first);
    expect(second[0]).not.toBe(first[0]);
  });

  it("invalidates cached lists after a mutation", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse([transaction]))
      .mockResolvedValueOnce(jsonResponse({ ...transaction, id: "tx-2" }))
      .mockResolvedValueOnce(jsonResponse([transaction]));
    vi.stubGlobal("fetch", fetchMock);

    const { HttpTransactionRepository } = await import(
      "@/lib/infra/transactions/httpTransactionRepository"
    );
    const repository = new HttpTransactionRepository();

    await repository.list();
    await repository.create({
      amount: 50,
      date: "2026-05-20",
      type: "deposit",
      description: "Extra",
      status: "PROCESSED",
      category: "INCOME",
    });
    await repository.list();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST" });
  });
});
