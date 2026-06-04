import { expect, type Page, test } from "@playwright/test";

import {
  createE2eAccountCredentials,
  deleteE2eUserByEmail,
  signUpThroughUi,
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

test("shows calendar month navigation and diary date links", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/calendar?year=2026&month=5");

    await expect(page.getByRole("heading", { name: "May 2026" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=4",
    );
    await expect(page.getByRole("link", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/calendar?year=2026&month=6",
    );
    await expect(page.getByRole("link", { name: "May 29, 2026" })).toHaveAttribute(
      "href",
      "/diary/2026-05-29",
    );
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("opens a diary date from the calendar", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/calendar?year=2026&month=5");
    await page.getByRole("link", { name: "May 29, 2026" }).click();

    await expect(page).toHaveURL(/\/diary\/2026-05-29$/);
    await expect(page.getByRole("heading", { name: "Friday, 29 May 2026" })).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("loads empty content for a new diary date", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/diary/2026-05-29");

    await expect(page.getByLabel("Diary entry")).toBeVisible();
    await expect(page.getByLabel("Diary entry")).toHaveValue("");
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("auto-saves diary content after editing", async ({ page }) => {
  const account = createE2eAccountCredentials();
  const content = "E2E saved diary content.";

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/diary/2026-05-29");

    await saveDiaryContent(page, content);
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("reloads saved content for the same diary date", async ({ page }) => {
  const account = createE2eAccountCredentials();
  const content = "E2E saved diary content.";

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/diary/2026-05-29");
    await saveDiaryContent(page, content);

    await page.reload();

    await expect(page.getByLabel("Diary entry")).toHaveValue(content);
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("marks saved diary dates on the calendar", async ({ page }) => {
  const account = createE2eAccountCredentials();
  const content = "E2E saved diary content.";

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/diary/2026-05-29");
    await saveDiaryContent(page, content);

    await page.goto("/calendar?year=2026&month=5");

    await expect(page.getByTestId("entry-marker-2026-05-29")).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("logs out from the calendar and redirects to signin", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);

    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page).toHaveURL(/\/signin(?:\?|$)/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("logs out from a saved diary date and redirects to signin", async ({ page }) => {
  const account = createE2eAccountCredentials();
  const content = "E2E saved diary content.";

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/diary/2026-05-29");
    await saveDiaryContent(page, content);

    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page).toHaveURL(/\/signin(?:\?|$)/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("signs back in and restores calendar access", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/signin(?:\?|$)/);

    await signInThroughUi(page, account);

    await expect(page).toHaveURL(/\/calendar(?:\?|$)/);
    await expect(page.getByText("Choose a day to open your entry.")).toBeVisible();
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("signs back in and reopens saved diary content", async ({ page }) => {
  const account = createE2eAccountCredentials();
  const content = "E2E saved diary content.";

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);
    await page.goto("/diary/2026-05-29");
    await saveDiaryContent(page, content);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/signin(?:\?|$)/);

    await signInThroughUi(page, account);
    await page.goto("/diary/2026-05-29");

    await expect(page.getByLabel("Diary entry")).toHaveValue(content);
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

test("shows invalid signin feedback without entering the app", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("missing@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/signin(?:\?|$)/);
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
  await expect(page.getByText("Choose a day to open your entry.")).toBeHidden();
});

test("returns not found for authenticated invalid diary dates", async ({ page }) => {
  const account = createE2eAccountCredentials();

  await deleteE2eUserByEmail(account.email);

  try {
    await signUpThroughUi(page, account);

    const response = await page.goto("/diary/not-a-date");

    expect(response?.status()).toBe(404);
  } finally {
    await deleteE2eUserByEmail(account.email);
  }
});

async function signInThroughUi(
  page: Page,
  account: ReturnType<typeof createE2eAccountCredentials>,
) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/calendar(?:\?|$)/);
}

async function saveDiaryContent(page: Page, content: string) {
  await page.getByLabel("Diary entry").fill(content);
  await expect(page.getByText(/^Saved$/)).toBeVisible();
}
