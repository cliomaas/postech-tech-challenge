import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/infra/auth/passwordHash";

describe("passwordHash", () => {
  it("validates the original password against the generated hash", async () => {
    const hash = await hashPassword("minha-senha");

    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain("minha-senha");
    await expect(verifyPassword("minha-senha", hash)).resolves.toBe(true);
  });

  it("rejects wrong passwords and invalid hashes", async () => {
    const hash = await hashPassword("senha-correta");

    await expect(verifyPassword("senha-errada", hash)).resolves.toBe(false);
    await expect(verifyPassword("senha-correta", "hash-invalido")).resolves.toBe(false);
  });
});
