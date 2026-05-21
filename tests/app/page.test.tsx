import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("renders the generated starter page", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: /to get started/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /documentation/i })).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org/docs"),
    );
  });
});
