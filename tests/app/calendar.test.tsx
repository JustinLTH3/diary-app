import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CalendarPage from "@/app/(app)/calendar/page";

describe("CalendarPage", () => {
  it("renders the temporary signin success page", () => {
    render(<CalendarPage />);

    expect(screen.getByRole("heading", { name: "Sign in success." })).toBeInTheDocument();
  });
});
