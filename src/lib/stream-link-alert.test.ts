import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findMissingStreamAlerts,
  STREAM_ALERT_WINDOW_MS,
  type StreamAlertMatch,
} from "./stream-link-alert-core.ts";

function match(
  partial: Partial<StreamAlertMatch> & Pick<StreamAlertMatch, "id" | "startsAt">,
): StreamAlertMatch {
  return {
    competitionKind: "liga",
    competitionLabel: "2. Bundesliga Frauen",
    home: { short: "Füchse" },
    away: { short: "Bremen" },
    status: "scheduled",
    streamUrl: null,
    ...partial,
  };
}

describe("findMissingStreamAlerts", () => {
  const now = Date.parse("2026-11-19T10:00:00+01:00");

  it("alerts when kickoff is inside the 48h window and stream is missing", () => {
    const kickoff = new Date(now + 30 * 60 * 60 * 1000).toISOString();
    const found = findMissingStreamAlerts(
      [match({ id: "soon", startsAt: kickoff, streamUrl: null })],
      now,
    );
    assert.equal(found.length, 1);
    assert.equal(found[0].id, "soon");
    assert.ok(found[0].hoursUntilKickoff > 29 && found[0].hoursUntilKickoff < 31);
  });

  it("ignores matches that already have a stream", () => {
    const kickoff = new Date(now + 20 * 60 * 60 * 1000).toISOString();
    const found = findMissingStreamAlerts(
      [
        match({
          id: "ok",
          startsAt: kickoff,
          streamUrl: "https://sporteurope.tv/fuechse-berlin-frauen/game",
        }),
      ],
      now,
    );
    assert.equal(found.length, 0);
  });

  it("ignores matches outside the 48h window", () => {
    const kickoff = new Date(now + STREAM_ALERT_WINDOW_MS + 60_000).toISOString();
    const found = findMissingStreamAlerts(
      [match({ id: "later", startsAt: kickoff, streamUrl: null })],
      now,
    );
    assert.equal(found.length, 0);
  });

  it("ignores finished matches and tournaments", () => {
    const kickoff = new Date(now + 10 * 60 * 60 * 1000).toISOString();
    const found = findMissingStreamAlerts(
      [
        match({ id: "done", startsAt: kickoff, status: "finished", streamUrl: null }),
        match({
          id: "cup",
          startsAt: kickoff,
          competitionKind: "turnier",
          competitionLabel: "Cup",
          streamUrl: null,
        }),
      ],
      now,
    );
    assert.equal(found.length, 0);
  });

  it("includes pokal matches", () => {
    const kickoff = new Date(now + 12 * 60 * 60 * 1000).toISOString();
    const found = findMissingStreamAlerts(
      [
        match({
          id: "pokal",
          startsAt: kickoff,
          competitionKind: "pokal",
          competitionLabel: "DHB-Pokal Frauen",
          streamUrl: null,
        }),
      ],
      now,
    );
    assert.equal(found.length, 1);
    assert.equal(found[0].id, "pokal");
  });
});
