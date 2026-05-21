import { expect, test } from "@playwright/test";

test("renders the generated starter page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /to get started/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Documentation" })).toBeVisible();
});
