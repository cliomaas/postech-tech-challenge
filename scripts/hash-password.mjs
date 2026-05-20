#!/usr/bin/env node
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
};

const password = process.argv[2];

if (!password) {
  console.error("Uso: npm run auth:hash -- sua-senha");
  process.exit(1);
}

const salt = randomBytes(16).toString("base64url");
const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

console.log(
  [
    "scrypt",
    SCRYPT_OPTIONS.N,
    SCRYPT_OPTIONS.r,
    SCRYPT_OPTIONS.p,
    salt,
    derivedKey.toString("base64url"),
  ].join("$")
);
