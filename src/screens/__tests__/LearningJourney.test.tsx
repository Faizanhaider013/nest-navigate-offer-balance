import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../../app/App";
import { GameProvider } from "../../app/GameProvider";
import { OutcomeBanner } from "../../components/feedback/OutcomeBanner";
import { SCENARIOS } from "../../data/scenarios";
import { DEFAULT_OFFER, scoreOffer } from "../../engine";
import type { OutcomeKind } from "../../state/types";
import { friendlyTip } from "../results/presentation";

describe("Responsible outcome presentation", () => {
  const cases: [OutcomeKind, boolean, string, RegExp][] = [
    ["strongWin", true, "positive", /healthy balance/i],
    ["narrowWin", true, "positive", /room to reflect/i],
    ["acceptedRisky", true, "caution", /check in with you/i],
    ["rejectedHealthy", false, "calm", /protected what matters/i],
    ["rejectedStretched", false, "reflective", /better balance/i],
    ["overextended", true, "caution", /asks too much/i],
  ];
  it.each(cases)(
    "%s has an appropriate message and tone",
    (outcome, won, tone, title) => {
      render(<OutcomeBanner outcome={outcome} won={won} />);
      const banner = screen.getByRole("region", { name: "Offer outcome" });
      expect(banner).toHaveAttribute("data-tone", tone);
      expect(
        within(banner).getByRole("heading", { name: title }),
      ).toBeInTheDocument();
      expect(
        within(banner).getByText(
          won ? "Offer accepted" : "Another offer was chosen",
        ),
      ).toBeInTheDocument();
    },
  );
  it("preserves a rejection when an overextended offer loses", () => {
    render(<OutcomeBanner outcome="overextended" won={false} />);
    expect(screen.getByText("Another offer was chosen")).toBeInTheDocument();
    expect(screen.queryByText("Offer accepted")).not.toBeInTheDocument();
  });
});

describe("Complete learning journey", () => {
  it("presents submitted engine snapshots through all three homes and resets", async () => {
    const user = userEvent.setup();
    render(
      <GameProvider>
        <App />
      </GameProvider>,
    );
    await user.click(screen.getByRole("button", { name: /start playing/i }));
    expect(screen.getByRole("main")).toHaveFocus();
    for (const [index, scenario] of SCENARIOS.entries()) {
      const expected = scoreOffer(DEFAULT_OFFER, scenario);
      await user.click(
        screen.getByRole("button", { name: /submit this offer/i }),
      );
      expect(
        screen.getByRole("heading", { name: "Seeing how it lands" }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: /see the result/i }));
      expect(screen.getByRole("main")).toHaveFocus();
      expect(
        screen.getByRole("meter", { name: /buyer safety/i }),
      ).toHaveAttribute("aria-valuenow", String(expected.buyerSafety));
      expect(
        screen.getByRole("meter", { name: /seller appeal/i }),
      ).toHaveAttribute(
        "aria-valuenow",
        String(Math.round(expected.playerAppeal)),
      );
      expect(screen.getByText(scenario.sellerNote)).toBeInTheDocument();
      const winner = scenario.competitors.find(
        (c) => c.id === expected.winnerId,
      );
      if (winner)
        expect(
          screen.getByRole("heading", {
            name: `${winner.name} had the chosen offer.`,
          }),
        ).toBeInTheDocument();
      if (expected.counterfactual)
        expect(
          screen.getByText(friendlyTip(expected.counterfactual.message)),
        ).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", {
          name:
            index === SCENARIOS.length - 1 ? /see how you did/i : /next home/i,
        }),
      );
    }
    expect(
      screen.getByRole("heading", { name: "How you did" }),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("region", { name: "Your home journey" }),
      ).getAllByRole("article"),
    ).toHaveLength(SCENARIOS.length);
    for (const scenario of SCENARIOS)
      expect(screen.getByText(scenario.homeLabel)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /play again/i }));
    expect(
      screen.getByRole("heading", { name: "Offer Balance" }),
    ).toBeInTheDocument();
  });
});
