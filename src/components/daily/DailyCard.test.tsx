import { cleanup, render, screen } from "@testing-library/react";
import DailyCard from "./DailyCard";

import { getBattleSolutions } from "@/lib/data";
import { BrowserRouter } from "react-router-dom";
import { formatDateLabel } from "@/lib/dates";
import { getSolutionImageUrl } from "@/lib/images";

function getTestSolution() {
  const solutions = getBattleSolutions();
  return solutions[0];
}

function renderTodayCard({ isSolved = true }) {
  const solution = getTestSolution();

  if (isSolved) {
    render(<DailyCard state={"today"} solution={solution} />, {
      wrapper: BrowserRouter,
    });
  } else {
    render(<DailyCard state={"today"} solution={{ ...solution, score: 0 }} />, {
      wrapper: BrowserRouter,
    });
  }

  return { solution };
}

function renderTomorrowCard() {
  const solution = getTestSolution();

  render(<DailyCard state={"tomorrow"} solution={solution} />, {
    wrapper: BrowserRouter,
  });

  return { solution };
}

function renderFarPastCard() {
  const solution = getTestSolution();

  render(<DailyCard state={"far-past"} solution={solution} />, {
    wrapper: BrowserRouter,
  });

  return { solution };
}

// function renderUnsolvedSolutionCard() {
//   const solution = getTestSolution();

//   const unsolvedSolution = {
//     ...solution,
//     score: 0,
//   };

//   render(<DailyCard state={"far-past"} solution={unsolvedSolution} />, {
//     wrapper: BrowserRouter,
//   });
//   return unsolvedSolution;
// }

const nonTomorrowRenderers = [renderTodayCard, renderFarPastCard];

test.afterEach(cleanup);

describe("today compleated daily card", () => {
  it("renders today next to date", () => {
    renderTodayCard({ isSolved: true });

    const todayText = screen.getByText(/today/i);

    expect(todayText).toBeInTheDocument();
  });
});

describe("tomorrow daily card", () => {
  it("doesn't render the link", () => {
    renderTomorrowCard();

    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(0);
  });

  it("displays the unlocks in", () => {
    renderTomorrowCard();

    expect(screen.getByText(/unlocks in/i)).toBeInTheDocument();
  });
});

describe("far past daily card", () => {
  it("doesn't render the today text", () => {
    renderFarPastCard();

    const todayText = screen.queryByText(/today/i);

    expect(todayText).not.toBeInTheDocument();
  });
});

describe("today and far past daily cards", () => {
  it("render the outer link with href", () => {
    nonTomorrowRenderers.forEach((render) => {
      const { solution } = render({ isSolved: true });

      const links = screen.queryAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", `/solutions/${solution.id}`);

      cleanup();
    });
  });

  it("render date", () => {
    nonTomorrowRenderers.forEach((render) => {
      const { solution } = render({ isSolved: true });
      const { date } = solution;
      const dateLabel = formatDateLabel(date);

      expect(screen.getByText(dateLabel)).toBeInTheDocument();

      cleanup();
    });
  });

  it("renders score and characters", () => {
    nonTomorrowRenderers.forEach((render) => {
      const { solution } = render({ isSolved: true });
      const { score, characters } = solution;

      expect(screen.getByText(/your score/i)).toBeInTheDocument();
      expect(screen.getByText(score)).toBeInTheDocument();
      const charsRegex = new RegExp(`${characters}`, "i");
      expect(screen.getByText(charsRegex)).toBeInTheDocument();
      cleanup();
    });
  });

  it("renders the target image", () => {
    nonTomorrowRenderers.forEach((render) => {
      const { solution } = render({ isSolved: true });

      const imageSrc = getSolutionImageUrl(solution);

      const imageNode = screen.getByRole("img");
      expect(imageNode).toBeInTheDocument();
      expect(imageNode).toHaveAttribute("src", imageSrc);
      cleanup();
    });
  });
});
