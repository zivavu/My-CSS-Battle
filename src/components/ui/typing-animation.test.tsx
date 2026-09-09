import { act, render, screen } from "@testing-library/react";
import { TypingAnimation } from "./typing-animation";

const words = ["hello", "bye", "cya", "later"];
const typeSpeed = 20;
// The component derives its delete speed from the type speed, so this is the
// shortest interval any timer in the animation can use.
const tickMs = typeSpeed / 2;

function renderComponent() {
  render(
    <TypingAnimation words={words} typeSpeed={typeSpeed} startOnView={false} />,
  );

  return {
    OuterSpan: screen.getByTestId("animated-text-container"),
    TextSpan: screen.getByTestId("animated-text"),
  };
}

async function advanceBy(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += tickMs) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(tickMs);
    });
  }
}

async function advanceUntilText(
  el: HTMLElement,
  text: string,
  budget = 20_000,
) {
  for (let elapsed = 0; elapsed < budget; elapsed += tickMs) {
    if (el.textContent === text) return;
    await advanceBy(tickMs);
  }

  throw new Error(
    `Text never became ${JSON.stringify(
      text,
    )} within ${budget}ms (last value: ${JSON.stringify(el.textContent)})`,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("typing animation", () => {
  it("initializes with the cursor", () => {
    const { OuterSpan } = renderComponent();

    expect(OuterSpan).toBeInTheDocument();
    expect(OuterSpan).toHaveTextContent("|");
  });

  it("initializes with empty text", () => {
    const { TextSpan } = renderComponent();

    expect(TextSpan.textContent).toEqual("");
  });

  it("types one character per interval", async () => {
    const { TextSpan } = renderComponent();

    await advanceBy(typeSpeed);
    expect(TextSpan.textContent).toEqual("h");

    await advanceBy(typeSpeed * 2);
    expect(TextSpan.textContent).toEqual("hel");
  });

  it("prints the whole word, deletes it, and prints next one", async () => {
    const { TextSpan } = renderComponent();

    await advanceUntilText(TextSpan, words[0]);
    await advanceUntilText(TextSpan, "");
    await advanceUntilText(TextSpan, words[1]);
  });

  it("stays on the last word after ending the cycle", async () => {
    const { TextSpan } = renderComponent();
    const lastWord = words.at(-1)!;

    await advanceUntilText(TextSpan, lastWord);

    await advanceBy(5_000);

    expect(TextSpan.textContent).toEqual(lastWord);
  });

  it("hides the cursor once the last word is complete", async () => {
    const { TextSpan, OuterSpan } = renderComponent();

    await advanceUntilText(TextSpan, words.at(-1)!);
    await advanceBy(typeSpeed * 2);

    expect(OuterSpan).not.toHaveTextContent("|");
  });

  it("does not start while out of view when startOnView is set", async () => {
    render(<TypingAnimation words={words} typeSpeed={typeSpeed} startOnView />);
    const TextSpan = screen.getByTestId("animated-text");

    await advanceBy(1_000);

    expect(TextSpan.textContent).toEqual("");
  });
});
