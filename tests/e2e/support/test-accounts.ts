import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, type Page } from "@playwright/test";
import { Client } from "pg";

const e2eUsernamePrefix = "e2e";

export type E2eAccountCredentials = {
  username: string;
  password: string;
};

export function createE2eAccountCredentials(): E2eAccountCredentials {
  return {
    username: createE2eUsername(),
    password: "password123",
  };
}

export function createE2eUsername() {
  const uniqueId = randomUUID().replaceAll("-", "").slice(0, 12);

  return `${e2eUsernamePrefix}_${Date.now()}_${uniqueId}`;
}

export async function signUpThroughUi(page: Page, account: E2eAccountCredentials) {
  await page.goto("/signup");
  await page.getByLabel("Username").fill(account.username);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(/\/calendar(?:\?|$)/);
}

export async function deleteE2eUserByUsername(username: string) {
  const client = new Client({
    connectionString: getDatabaseUrl(),
  });

  await client.connect();

  try {
    await client.query('DELETE FROM "User" WHERE username = $1', [username]);
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
