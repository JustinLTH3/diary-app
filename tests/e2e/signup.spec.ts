import { expect, test } from "@playwright/test";

import {
  createE2eAccountCredentials,
  deleteE2eUserByUsername,
  signUpThroughUi,
} from "./support/test-accounts";

test("renders the signup page", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByRole("heading", { name: "Begin Your Journey" })).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/signin");
});

test("signs up a new user and lands on the calendar", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByUsername(account.username);

  try {
    await signUpThroughUi(page, account);

    await expect(page).toHaveURL(/\/calendar(?:\?|$)/);
    await expect(page.getByText("Choose a day to open your entry.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  } finally {
    await deleteE2eUserByUsername(account.username);
  }
});
