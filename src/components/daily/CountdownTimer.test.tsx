import { screen } from "@testing-library/dom";
import { act, render } from "@testing-library/react";
import CountdownTimer from "./CountdownTimer";

function renderComponent() {
  render(<CountdownTimer />);
}

describe("countdown timer", () => {
  it("displays the time", () => {
    renderComponent();

    expect(screen.getByText(/\d\d:\d\d:\d\d/)).toBeInTheDocument();
  });

  it("changes the time value", () => {
    vi.useFakeTimers();

    renderComponent();

    const timerEl = screen.getByText(/\d\d:\d\d:\d\d/);
    const initialTime = timerEl.textContent;

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    const nextTime = timerEl.textContent;
    console.log(nextTime);

    expect(initialTime).not.toEqual(nextTime);

    vi.useRealTimers();
  });
});
