import type { Match } from "@/lib/data";
import type { MatchReport } from "@/lib/parse-press-report";

export function MatchReportStats({
  match,
  report,
}: {
  match: Match;
  report: MatchReport;
}) {
  const scorers = [...report.ourTeam.players]
    .filter((player) => player.goals > 0)
    .sort((a, b) => b.goals - a.goals);
  const seven = report.ourTeam.players.filter((player) => player.sevenMeterAttempts > 0);
  const penalties = report.ourTeam.players.filter((player) => player.twoMinutes > 0);
  const homeScore = report.homeScore ?? match.homeScore;
  const awayScore = report.awayScore ?? match.awayScore;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
          Endergebnis
        </p>
        <p className="mt-2 font-[family-name:var(--fb-font-display)] text-4xl font-extrabold tabular-nums">
          {homeScore ?? "–"}:{awayScore ?? "–"}
        </p>
        <p className="mt-1 text-sm text-[var(--fb-text-muted)]">
          Halbzeit {report.homeHalftime ?? "–"}:{report.awayHalftime ?? "–"}
          {report.attendance != null ? ` · ${report.attendance} Zuschauer` : ""}
        </p>
      </div>

      <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
          Torschützinnen Füchse
        </p>
        {scorers.length > 0 ? (
          <ol className="mt-3 space-y-1.5">
            {scorers.map((player) => (
              <li key={player.number} className="flex justify-between gap-3 text-sm">
                <span>
                  {player.number} {player.name}
                </span>
                <span className="font-semibold tabular-nums">{player.goals}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[var(--fb-text-muted)]">Keine Treffer im Spielbericht.</p>
        )}
      </div>

      <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
          Siebenmeter
        </p>
        {seven.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-sm">
            {seven.map((player) => (
              <li key={player.number}>
                {player.number} {player.name}: {player.sevenMeterMade}/{player.sevenMeterAttempts}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--fb-text-muted)]">Keine Siebenmeter.</p>
        )}
      </div>

      <div className="rounded-[var(--fb-radius-lg)] border border-[var(--fb-border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fb-text-faint)]">
          Zeitstrafen
        </p>
        {penalties.length > 0 ? (
          <ul className="mt-3 space-y-1.5 text-sm">
            {penalties.map((player) => (
              <li key={player.number}>
                {player.number} {player.name}: {player.twoMinutes}×2 min
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--fb-text-muted)]">Keine Zeitstrafen.</p>
        )}
      </div>
    </div>
  );
}
