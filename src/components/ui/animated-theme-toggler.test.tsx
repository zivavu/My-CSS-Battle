import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

type AnimateArgs = Parameters<Element["animate"]>;

let animateSpy: ReturnType<typeof vi.fn<(...args: AnimateArgs) => Animation>>;
let finishViewTransition: () => void;

function readClipPathKeyframes(call: AnimateArgs) {
  const [keyframes] = call;

  return (keyframes as PropertyIndexedKeyframes).clipPath as string[];
}

async function renderComponent() {
  render(<AnimatedThemeToggler />);

  const buttonEl = screen.getByRole("button");

  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });

  return { buttonEl };
}

beforeEach(() => {
  const finished = new Promise<void>((resolve) => {
    finishViewTransition = () => resolve();
  });

  Object.defineProperty(document, "startViewTransition", {
    writable: true,
    configurable: true,
    value: vi.fn((callback: () => void) => {
      callback();

      return { ready: Promise.resolve(), finished };
    }),
  });

  animateSpy = vi.fn<(...args: AnimateArgs) => Animation>(
    () =>
      ({
        finished: Promise.resolve(),
        cancel: vi.fn(),
        play: vi.fn(),
      }) as unknown as Animation,
  );

  Element.prototype.animate = animateSpy;
});

afterEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  delete document.documentElement.dataset.magicuiThemeVt;
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("animated theme toggle", () => {
  it("switches the dark class on the html element when switching mode", async () => {
    const { buttonEl } = await renderComponent();

    expect(document.documentElement).not.toHaveClass("dark");

    fireEvent.click(buttonEl);

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toEqual("dark");

    fireEvent.click(buttonEl);

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toEqual("light");
  });

  it("plays the circle animation", async () => {
    const { buttonEl } = await renderComponent();

    fireEvent.click(buttonEl);

    expect(document.documentElement).toHaveAttribute(
      "data-magicui-theme-vt",
      "active",
    );

    await waitFor(() => {
      expect(animateSpy).toHaveBeenCalledTimes(1);
    });

    const [from, to] = readClipPathKeyframes(animateSpy.mock.calls[0]);

    expect(from).toMatch(/^circle\(0px at [\d.]+px [\d.]+px\)$/);
    expect(to).toMatch(/^circle\([\d.]+px at [\d.]+px [\d.]+px\)$/);
    expect(to).not.toEqual(from);

    expect(animateSpy.mock.calls[0][1]).toMatchObject({
      duration: 400,
      easing: "ease-in-out",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    });
  });

  it("clears the transition state once the view transition finishes", async () => {
    const { buttonEl } = await renderComponent();

    fireEvent.click(buttonEl);

    expect(document.documentElement).toHaveAttribute(
      "data-magicui-theme-vt",
      "active",
    );
    expect(
      document.documentElement.style.getPropertyValue(
        "--magicui-theme-vt-clip-from",
      ),
    ).toMatch(/^circle\(0px at /);

    finishViewTransition();

    await waitFor(() => {
      expect(document.documentElement).not.toHaveAttribute(
        "data-magicui-theme-vt",
      );
    });

    expect(
      document.documentElement.style.getPropertyValue(
        "--magicui-theme-vt-clip-from",
      ),
    ).toEqual("");
  });

  it("still toggles the theme when startViewTransition is unavailable", async () => {
    Reflect.deleteProperty(document, "startViewTransition");

    const { buttonEl } = await renderComponent();

    fireEvent.click(buttonEl);

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveAttribute(
      "data-magicui-theme-vt",
    );
    expect(animateSpy).not.toHaveBeenCalled();
  });
});
