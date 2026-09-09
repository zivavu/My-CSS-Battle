import { TypingAnimation } from "./typing-animation";
import { act, render, screen, waitFor } from "@testing-library/react";

const words = ["hello", "bye", "cya", "later"];

interface WaitForElementTextContentArgs {
  el: HTMLElement;
  word: string;
}

async function waitForElementsTextContent({
  el,
  word,
}: WaitForElementTextContentArgs) {
  await waitFor(
    () => {
      expect(el.textContent).toEqual(word);
    },
    { timeout: 5000 },
  );
}

function renderComponent() {
  render(<TypingAnimation words={words} typeSpeed={20} startOnView={false} />);
  const OuterSpan = screen.getByRole("generic", {
    name: "animated-text-container",
  });
  const TextSpan = screen.getByRole("generic", {
    name: "animated-text",
  });

  return { OuterSpan, TextSpan };
}

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

  it("types text", () => {
    vi.useFakeTimers();

    const { OuterSpan } = renderComponent();

    expect(OuterSpan).toHaveTextContent("|");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(OuterSpan.textContent).toContain("h");
  });

  it("prints the whole word, deletes it, and prints next one", async () => {
    const { TextSpan } = renderComponent();

    await waitForElementsTextContent({ el: TextSpan, word: words[0] });
    await waitForElementsTextContent({ el: TextSpan, word: "" });
    await waitForElementsTextContent({ el: TextSpan, word: words[1] });
  });

  it("stays on the last word after ending the cycle", async () => {
    vi.useFakeTimers();

    const { TextSpan } = renderComponent();
    const lastWord = words.at(-1)!;

    let reachedLastWord = false;

    for (let elapsed = 0; elapsed < 20_000; elapsed += 20) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });

      if (TextSpan.textContent === lastWord) {
        reachedLastWord = true;
        break;
      }
    }

    expect(reachedLastWord).toBe(true);
    expect(TextSpan).toHaveTextContent(lastWord);

    for (let elapsed = 0; elapsed < 2_000; elapsed += 20) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });
    }

    expect(TextSpan).toHaveTextContent(lastWord);
  });
});
