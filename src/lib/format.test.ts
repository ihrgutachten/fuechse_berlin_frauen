import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatMatchDate,
  formatNewsDate,
  formatScenarioTime,
} from "./format.ts";

describe("formatMatchDate", () => {
  it("shows HBF UTC kickoff as Berlin wall time (winter)", () => {
    // Viertelfinale vs. Thüringer HC: HBF start 18:00Z = 19:00 Europe/Berlin
    const label = formatMatchDate("2026-11-18T18:00:00+00:00");
    assert.match(label, /19:00/);
    assert.doesNotMatch(label, /18:00/);
  });

  it("shows HBF UTC kickoff as Berlin wall time (summer)", () => {
    // 1. Pokalrunde vs. Bremen: HBF start 17:00Z = 19:00 Europe/Berlin (CEST)
    const label = formatMatchDate("2026-08-21T17:00:00+00:00");
    assert.match(label, /19:00/);
  });

  it("matches formatScenarioTime for the clock", () => {
    const iso = "2026-11-18T18:00:00+00:00";
    assert.equal(formatScenarioTime(iso), "19:00");
    assert.match(formatMatchDate(iso), new RegExp(formatScenarioTime(iso)));
  });
});

describe("formatNewsDate", () => {
  it("keeps the Berlin calendar day near midnight UTC", () => {
    // 23:30 Berlin on 17.11. is still 17. in Berlin, 22:30Z
    assert.equal(formatNewsDate("2026-11-17T22:30:00+00:00"), "17. November 2026");
  });
});
