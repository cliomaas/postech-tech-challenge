import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "crypto";

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
} as const;

function deriveKey(password: string, salt: string, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await deriveKey(password, salt, SCRYPT_OPTIONS);

  return [
    "scrypt",
    SCRYPT_OPTIONS.N,
    SCRYPT_OPTIONS.r,
    SCRYPT_OPTIONS.p,
    salt,
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, n, r, p, salt, storedHash] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !storedHash) {
    return false;
  }

  const derivedKey = await deriveKey(password, salt, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  const storedKey = Buffer.from(storedHash, "base64url");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}
