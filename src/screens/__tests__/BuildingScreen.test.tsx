import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../../app/App";
import { GameProvider } from "../../app/GameProvider";
import { SCENARIOS } from "../../data/scenarios";
import { DEFAULT_OFFER, scoreOffer } from "../../engine";
import type { Offer } from "../../state/types";

const R1 = SCENARIOS[0];

/** Render the app and advance into the BUILDING phase (so UPDATE_OFFER is legal). */
async function renderAtBuilding() {
  const user = userEvent.setup();
  render(
    <GameProvider>
      <App />
    </GameProvider>,
  );
  await user.click(screen.getByRole("button", { name: /start/i }));
  return user;
}

const safetyNow = () =>
  screen
    .getByRole("meter", { name: /buyer safety/i })
    .getAttribute("aria-valuenow");
const appealNow = () =>
  screen
    .getByRole("meter", { name: /seller appeal/i })
    .getAttribute("aria-valuenow");

const expectMetersMatch = (offer: Offer) => {
  const r = scoreOffer(offer, R1);
  expect(safetyNow()).toBe(String(r.buyerSafety));
  expect(appealNow()).toBe(String(Math.round(r.playerAppeal)));
};

describe("BuildingScreen — scenario display", () => {
  it("shows the current home, list price, seller note, and round indicator", async () => {
    await renderAtBuilding();
    expect(screen.getByText(/home 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(R1.homeLabel)).toBeInTheDocument();
    expect(screen.getByText(R1.sellerNote)).toBeInTheDocument();
    expect(screen.getAllByText("$400,000").length).toBeGreaterThan(0); // list price, formatted
  });

  it("advances to the next home with the correct scenario after a round", async () => {
    const user = await renderAtBuilding();
    await user.click(
      screen.getByRole("button", { name: /submit this offer/i }),
    );
    await user.click(screen.getByRole("button", { name: /see the result/i })); // reveal placeholder
    await user.click(screen.getByRole("button", { name: /next home/i })); // debrief placeholder

    expect(screen.getByText(/home 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(SCENARIOS[1].homeLabel)).toBeInTheDocument();
    expect(screen.getByText(SCENARIOS[1].sellerNote)).toBeInTheDocument();
  });
});

describe("BuildingScreen — controls drive the engine-derived feedback", () => {
  it("default feedback matches the engine for DEFAULT_OFFER (no duplicated logic)", async () => {
    await renderAtBuilding();
    expectMetersMatch(DEFAULT_OFFER);
    // sanity: the known golden values for the default offer in R1
    expect(safetyNow()).toBe("81");
    expect(appealNow()).toBe("40");
  });

  it("price slider updates pricePct and the feedback follows the engine", async () => {
    await renderAtBuilding();
    const slider = screen.getByRole("slider", { name: /your price/i });
    fireEvent.change(slider, { target: { value: "8" } });
    expectMetersMatch({ ...DEFAULT_OFFER, pricePct: 8 });
  });

  const selectorCases: Array<{
    field: keyof Offer;
    radio: RegExp;
    offer: Partial<Offer>;
  }> = [
    { field: "earnest", radio: /larger/i, offer: { earnest: "high" } },
    {
      field: "inspection",
      radio: /skip the inspection/i,
      offer: { inspection: "waived" },
    },
    {
      field: "financing",
      radio: /waive your loan safety net/i,
      offer: { financing: "waived" },
    },
    {
      field: "timeline",
      radio: /flexible move-in/i,
      offer: { timeline: "flexible" },
    },
  ];

  for (const { field, radio, offer } of selectorCases) {
    it(`${field} selector updates only its field and the feedback follows the engine`, async () => {
      const user = await renderAtBuilding();
      await user.click(screen.getByRole("radio", { name: radio }));
      expectMetersMatch({ ...DEFAULT_OFFER, ...offer });
    });
  }

  it("changing one control preserves unrelated offer fields", async () => {
    const user = await renderAtBuilding();
    fireEvent.change(screen.getByRole("slider", { name: /your price/i }), {
      target: { value: "8" },
    });
    await user.click(screen.getByRole("radio", { name: /larger/i })); // earnest high
    // if other fields were reset, these numbers would not match
    expectMetersMatch({ ...DEFAULT_OFFER, pricePct: 8, earnest: "high" });
  });
});

describe("BuildingScreen — submit & accessibility", () => {
  it("announces updated engine feedback in one polite status region", async () => {
    await renderAtBuilding();
    fireEvent.change(screen.getByRole("slider", { name: /your price/i }), {
      target: { value: "8" },
    });
    const result = scoreOffer({ ...DEFAULT_OFFER, pricePct: 8 }, R1);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(
      `Buyer safety: ${result.buyerSafety} of 100`,
    );
    expect(status).toHaveTextContent(
      `Seller appeal: ${Math.round(result.playerAppeal)} of 100`,
    );
  });

  it("explains overextension without blocking submission and clears it when protections return", async () => {
    const user = await renderAtBuilding();
    fireEvent.change(screen.getByRole("slider", { name: /your price/i }), {
      target: { value: "10" },
    });
    await user.click(screen.getByRole("radio", { name: /larger/i }));
    await user.click(
      screen.getByRole("radio", { name: /skip the inspection/i }),
    );
    await user.click(
      screen.getByRole("radio", { name: /waive your loan safety net/i }),
    );
    expect(
      screen.getByText(/beyond your comfort boundary/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit this offer/i }),
    ).toBeEnabled();
    await user.click(screen.getByRole("radio", { name: /full inspection/i }));
    await user.click(
      screen.getByRole("radio", { name: /keep your loan safety net/i }),
    );
    expect(
      screen.queryByText(/beyond your comfort boundary/i),
    ).not.toBeInTheDocument();
  });

  it("connects control descriptions and a keyboard-accessible feedback shortcut", async () => {
    const user = await renderAtBuilding();
    const option = screen.getByRole("radio", { name: /larger/i });
    expect(option).toHaveAccessibleDescription(/signals to the seller/i);
    await user.click(option);
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("radio", { name: /standard.*3%/i })).toBeChecked();
    const link = screen.getByRole("link", { name: /see live feedback/i });
    expect(link).toHaveAttribute("href", "#offer-feedback");
    expect(screen.getByRole("complementary")).toHaveAttribute(
      "id",
      "offer-feedback",
    );
  });

  it("submit dispatches SUBMIT_OFFER and transitions to revealing", async () => {
    const user = await renderAtBuilding();
    await user.click(
      screen.getByRole("button", { name: /submit this offer/i }),
    );
    expect(
      screen.getByRole("heading", { name: "Seeing how it lands" }),
    ).toBeInTheDocument();
  });

  it("exposes semantic, touch-friendly controls (native radios + range)", async () => {
    await renderAtBuilding();
    // 3 earnest + 3 inspection + 2 financing + 3 timeline = 11 radios
    expect(screen.getAllByRole("radio")).toHaveLength(11);
    expect(
      screen.getByRole("slider", { name: /your price/i }),
    ).toBeInTheDocument();
  });
});
