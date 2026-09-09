import { act, fireEvent, render, screen } from "@testing-library/react";
import Pagination, { type PaginationProps } from "./Pagination";
import { BrowserRouter } from "react-router-dom";

function renderComponent({
  currentPage,
  totalPages,
}: Omit<PaginationProps, "basePath">) {
  render(
    <Pagination
      basePath="test"
      currentPage={currentPage}
      totalPages={totalPages}
    />,
    { wrapper: BrowserRouter },
  );
}

describe("pagination", () => {
  it("moves to next page on button click", () => {
    renderComponent({ currentPage: 5, totalPages: 10 });

    const currentPageLink = screen.getByRole("link", { current: "page" });
    const nextPageButton = screen.getByText("next");

    screen.debug();

    act(() => {
      fireEvent.click(nextPageButton);
    });

    const newPageLink = screen.getByRole("link", { current: "page" });

    expect(currentPageLink).not.toStrictEqual(newPageLink);
  });
});
