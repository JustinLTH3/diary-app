import { hash } from "argon2";

export async function hashPassword(password: string) {
  return hash(password);
}
