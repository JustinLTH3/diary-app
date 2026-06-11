import { expect, test } from "@playwright/test";

import {
  createE2eAccountCredentials,
  deleteE2eUserByEmail,
  signUpThroughUi,
} from "./support/test-accounts";

test("redirects unauthenticated home to signin", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/signin(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
});

test("redirects authenticated home to calendar", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/");

    await expect(page).toHaveURL(/\/calendar(?:\?|$)/);
    await expect(page.getByText("Choose a day to open your entry.")).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});
