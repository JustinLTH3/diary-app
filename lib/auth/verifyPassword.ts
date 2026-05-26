import { verify } from "argon2";

export async function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
