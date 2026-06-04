import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Client } from "pg";

const e2eEmailDomain = "example.com";
const e2eEmailPrefix = "e2e";

export type E2eAccountCredentials = {
  email: string;
  password: string;
};

export function createE2eAccountCredentials(): E2eAccountCredentials {
  return {
    email: createE2eEmail(),
    password: "password123",
  };
}

export function createE2eEmail() {
  const uniqueId = randomUUID().replaceAll("-", "").slice(0, 12);

  return `${e2eEmailPrefix}-${Date.now()}-${uniqueId}@${e2eEmailDomain}`;
}

export async function deleteE2eUserByEmail(email: string) {
  const client = new Client({
    connectionString: getDatabaseUrl(),
  });

  await client.connect();

  try {
    await client.query('DELETE FROM "User" WHERE email = $1', [email]);
  } finally {
    await client.end();
  }
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFile();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL must be set in the environment or local .env file before using E2E database helpers.",
    );
  }

  return databaseUrl;
}

function readDatabaseUrlFromEnvFile() {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env"), "utf8");

    return parseEnvValue(envFile, "DATABASE_URL");
  } catch {
    return undefined;
  }
}

function parseEnvValue(contents: string, key: string) {
  const line = contents
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) {
    return undefined;
  }

  const value = line.slice(key.length + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
