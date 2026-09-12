import { getSession } from "@/lib/session";
import { MatchLeaderboard, SeasonLeaderboard } from "@/components/tippspiel/leaderboard";
import { TippspielMatchBanner } from "@/components/tippspiel/match-banner";
import { NicknameForm } from "@/components/tippspiel/nickname-form";
import { PredictionForm } from "@/components/tippspiel/prediction-form";
import { TippspielRules } from "@/components/tippspiel/rules";
import { SessionBar } from "@/components/tippspiel/session-bar";
import { tipCardClass } from "@/components/tippspiel/card";
import { SeasonPodium, WeeklyWinnerCard } from "@/components/tippspiel/highlights";
import { TippspielPrizes } from "@/components/tippspiel/prizes";
import { TippspielSponsorStrip } from "@/components/tippspiel/sponsor-strip";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { TIPPSPIEL_LOGIN_HREF } from "@/lib/callback-path";
import { isDatabaseConfigured } from "@/lib/db";
import {
  getCommunityTip,
  getMatchLeaderboard,
  getPrediction,
  getProfile,
  getSeasonLeaderboard,
} from "@/lib/tippspiel-db";
import {
  getTipPhase,
  predictionPoints,
} from "@/lib/tippspiel";
import { hydrateTippspiel } from "@/lib/tippspiel-results";

export const metadata = { title: "Tippspiel" };

export const dynamic = "force-dynamic";

export default async function TippspielPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  const { featured, lastFinished } = await hydrateTippspiel();
  const dbUp = isDatabaseConfigured();

  let dbError = false;
  let profile = null;
  let myTip = null;
  let lastTip = null;
  let community = null;
  let matchBoard: Awaited<ReturnType<typeof getMatchLeaderboard>> = [];
  let lastWeekBoard: Awaited<ReturnType<typeof getMatchLeaderboard>> = [];
  let seasonBoard: Awaited<ReturnType<typeof getSeasonLeaderboard>> = [];

  if (dbUp) {
    try {
      if (userId) profile = await getProfile(userId);
      if (featured) {
        community = await getCommunityTip(featured.id);
        matchBoard = await getMatchLeaderboard(featured.id, userId);
        if (userId) myTip = await getPrediction(userId, featured.id);
      }
      if (lastFinished) {
        lastWeekBoard = await getMatchLeaderboard(lastFinished.id, userId);
        if (userId && lastFinished.id !== featured?.id) {
          lastTip = await getPrediction(userId, lastFinished.id);
        }
      }
      seasonBoard = await getSeasonLeaderboard(userId);
    } catch (err) {
      console.error("[tippspiel] page load", err);
      dbError = true;
    }
  }

  const phase = featured ? getTipPhase(featured) : "open";
  const showScores = phase !== "open";
  const showPoints = phase === "scored";
  const showCommunity = Boolean(community && (myTip || showScores));
  const myScore =
    featured && myTip && featured.homeScore != null && featured.awayScore != null
      ? predictionPoints(myTip.homeScore, myTip.awayScore, featured.homeScore, featured.awayScore)
      : null;
  const lastScore =
    lastFinished && lastTip && lastFinished.homeScore != null && lastFinished.awayScore != null
      ? predictionPoints(
          lastTip.homeScore,
          lastTip.awayScore,
          lastFinished.homeScore,
          lastFinished.awayScore,
        )
      : null;

  return (
    <>
      <PageHero
        eyebrow="Fan-Tools"
        title="Spieltags-Tippspiel"
        titleNote="(Demoversion, aktuell kein echtes Gewinnspiel)"
        description={
          session?.user
            ? undefined
            : "Wöchentlich 2 Heimspiel-Tickets. Zur Saison ein von allen Spielerinnen unterschriebenes Trikot."
        }
        titleAction={
          session?.user ? (
            <SessionBar
              email={session.user.email}
              nickname={profile?.nickname}
              admin={session.user.admin}
            />
          ) : undefined
        }
      />

      <div className="border-t border-[var(--fb-home-line)] bg-[var(--fb-soft)]">
      <div className="mx-auto max-w-[var(--fb-container)] space-y-6 px-[var(--fb-gutter)] py-10 md:space-y-8 md:py-14">
        {!dbUp || dbError ? (
          <p className={`${tipCardClass} px-4 py-3 text-sm text-[var(--fb-text-muted)]`}>
            Speichern ist gerade nicht möglich. Regeln und das nächste Spiel siehst du trotzdem.
          </p>
        ) : null}

        {featured ? (
          <div className={`${tipCardClass} overflow-hidden`}>
            <section id="tipp" className="scroll-mt-24 bg-white p-5 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-[family-name:var(--fb-font-display)] text-2xl font-bold uppercase">
                {phase === "open" ? "Tipp abgeben" : "Dein Tipp"}
              </h2>
              {showCommunity && community ? (
                <p className="text-sm text-[var(--fb-text-muted)]">
                  Community-Tipp:{" "}
                  <strong className="text-[var(--fb-ink)]">
                    {community.homeScore}:{community.awayScore}
                  </strong>{" "}
                  aus {community.count} {community.count === 1 ? "Tipp" : "Tipps"}
                </p>
              ) : community ? (
                <p className="text-sm text-[var(--fb-text-muted)]">
                  {community.count} {community.count === 1 ? "Tipp" : "Tipps"} sind schon drin.
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              {!session?.user ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--fb-text-muted)]">
                    Nur zum Tippen: Email angeben, Anzeigename wählen, Tipp speichern. Bis zum
                    Anpfiff kannst du ihn noch ändern.
                  </p>
                  <Button href={TIPPSPIEL_LOGIN_HREF}>Mit Email tippen</Button>
                </div>
              ) : phase === "open" ? (
                <PredictionForm
                  key={myTip?.updatedAt ?? "new"}
                  matchId={featured.id}
                  homeLabel={featured.home.short}
                  awayLabel={featured.away.short}
                  initialHome={myTip?.homeScore ?? null}
                  initialAway={myTip?.awayScore ?? null}
                  needsNickname={!profile}
                />
              ) : !profile ? (
                <div className="max-w-md">
                  <p className="mb-4 text-sm text-[var(--fb-text-muted)]">
                    Ein Anzeigename für die Rangliste, dann kannst du beim nächsten Spiel tippen.
                  </p>
                  <NicknameForm />
                </div>
              ) : myTip ? (
                <div className="space-y-2">
                  <p className="font-[family-name:var(--fb-font-display)] text-4xl font-extrabold tabular-nums">
                    {myTip.homeScore}:{myTip.awayScore}
                  </p>
                  {myScore ? (
                    <p className="text-sm text-[var(--fb-text-muted)]">
                      {myScore.exact
                        ? `${myScore.points} Punkte, exakt.`
                        : `${myScore.points} ${myScore.points === 1 ? "Punkt" : "Punkte"}.`}
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--fb-text-muted)]">
                      Eingefroren. Punkte kommen nach dem offiziellen Endstand.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--fb-text-muted)]">
                  Für dieses Spiel hast du nicht getippt.
                </p>
              )}
            </div>
            </section>
            <TippspielMatchBanner match={featured} phase={phase} stacked />
          </div>
        ) : (
          <p className="text-[var(--fb-text-muted)]">Aktuell kein Pflichtspiel im Tippspiel.</p>
        )}

        <TippspielPrizes match={featured} />

        {lastFinished || seasonBoard.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {lastFinished ? (
              <WeeklyWinnerCard
                match={lastFinished}
                winner={lastWeekBoard[0] ?? null}
                yourTip={
                  lastTip
                    ? `Dein Tipp ${lastTip.homeScore}:${lastTip.awayScore}${
                        lastScore ? ` · ${lastScore.points} Punkte` : ""
                      }`
                    : session?.user
                      ? "Kein Tipp von dir"
                      : null
                }
              />
            ) : null}
            <SeasonPodium rows={seasonBoard} />
          </div>
        ) : null}

        {featured ? (
          <section className={`${tipCardClass} p-5 md:p-6`}>
            <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
              {showPoints ? "Spieltag" : "Rangliste"}
            </h2>
            <p className="mt-1 mb-4 text-sm text-[var(--fb-text-muted)]">
              {showScores
                ? showPoints
                  ? "Punkte nach dem offiziellen Endstand."
                  : "Tipps sind sichtbar, Punkte kommen nach dem offiziellen Endstand."
                : "Die einzelnen Stände bleiben bis zum Anpfiff verborgen."}
            </p>
            <MatchLeaderboard
              rows={matchBoard}
              showScores={showScores}
              showPoints={showPoints}
            />
          </section>
        ) : null}

        <section className={`${tipCardClass} p-5 md:p-6`}>
          <h2 className="font-[family-name:var(--fb-font-display)] text-xl font-bold uppercase">
            Saisonwertung
          </h2>
          <p className="mt-1 mb-4 text-sm text-[var(--fb-text-muted)]">
            Summe über alle abgerechneten Füchse-Spiele. Platz 1 gewinnt das signierte Saisontrikot.
          </p>
          <SeasonLeaderboard rows={seasonBoard} />
        </section>

        <TippspielRules />
        <TippspielSponsorStrip />

        <p className="text-xs leading-relaxed text-[var(--fb-text-faint)]">
          Demoversion, aktuell kein echtes Gewinnspiel. Kostenlos, kein Wetteinsatz. Die Preise
          (zwei Heimspiel-Tickets pro Spieltag, signiertes Saisontrikot) gelten erst, wenn das
          Tippspiel offiziell startet. Teilnahme dann ab 16 Jahren mit gültiger E-Mail.
        </p>
      </div>
      </div>
    </>
  );
}
