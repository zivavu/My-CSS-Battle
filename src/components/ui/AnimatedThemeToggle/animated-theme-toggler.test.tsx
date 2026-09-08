import { render, screen } from "@testing-library/react";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

function renderComponent() {
  render(<AnimatedThemeToggler />);

  const buttonEl = screen.getByRole("button");

  return { buttonEl };
}

describe("animated theme toggle works as intended", () => {
  it("adds the dark tag to the html element when switchig from the light mode", async () => {
    const { buttonEl } = renderComponent();
  });
});
