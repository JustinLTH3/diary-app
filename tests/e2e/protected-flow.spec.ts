import { expect, test } from "@playwright/test";

import {
  createE2eAccountCredentials,
  deleteE2eUserByEmail,
} from "./support/test-accounts";

test("redirects unauthenticated calendar access to signin", async ({ page }) => {
  await page.goto("/calendar");

  await expect(page).toHaveURL(/\/signin(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
});

test("redirects unauthenticated diary access to signin", async ({ page }) => {
  await page.goto("/diary/2026-05-29");

  await expect(page).toHaveURL(/\/signin(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
});

test("signs up a new user and lands on the calendar", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Password").fill(account.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(/\/calendar(?:\?|$)/);
    await expect(page.getByText("Choose a day to open your entry.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});
