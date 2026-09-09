import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

beforeEach(() => {
  Object.defineProperty(document, "startViewTransition", {
    writable: true,
    configurable: true,
    value: vi.fn((cb) => {
      cb();

      return {
        ready: Promise.resolve(),
        finished: new Promise(() => {}),
      };
    }),
  });

  Element.prototype.animate = vi.fn(() => ({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    play: vi.fn(),
  })) as unknown as any;
});

function renderComponent() {
  render(<AnimatedThemeToggler />);

  const buttonEl = screen.getByRole("button");

  return { buttonEl };
}

describe("animated theme toggle", () => {
  it("switches the dark class to the html element when switchig mode", async () => {
    const { buttonEl } = renderComponent();

    const getCurrentIsDark = () =>
      document.querySelector("html")?.classList.contains("dark");

    const isInitiallyDark = getCurrentIsDark();

    fireEvent.click(buttonEl);

    expect(isInitiallyDark).not.toEqual(getCurrentIsDark());

    fireEvent.click(buttonEl);

    expect(isInitiallyDark).toEqual(getCurrentIsDark());
  });

  it("plays the circle animation", async () => {
    const { buttonEl } = renderComponent();

    fireEvent.click(buttonEl);

    expect(document.documentElement).toHaveAttribute(
      "data-magicui-theme-vt",
      "active",
    );

    waitFor(async () => {
      expect(document.documentElement).not.toHaveAttribute(
        "data-magicui-theme-vt",
        "active",
      );
    });

    fireEvent.click(buttonEl);

    expect(document.documentElement).toHaveAttribute(
      "data-magicui-theme-vt",
      "active",
    );
  });
});
