import { TypingAnimation } from "./typing-animation";
import { render, screen } from "@testing-library/react";

describe("Typing animation works as intended", () => {
  it("Gets initialized with the empty string", () => {
    render(<TypingAnimation />);

    const TypingSpan = screen.getByRole("generic", { name: "animated-text" });

    expect(TypingSpan).toBeInTheDocument();
    expect(TypingSpan).toHaveTextContent("");
  });
});
