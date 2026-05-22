import { expect, test } from "@playwright/test";

test("renders the signup page", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByRole("heading", { name: "Begin Your Journey" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/signin");
});
