# Projekt-Brief: Website „Füchse Berlin Frauen"

Zweck: moderne Vereinsseite für Füchse Berlin Frauen (Frauen-Handball, 2. Handball-Bundesliga). Ablöse der bisherigen Broschüren-Seite. Wir bauen live — kein Pitch-Draft.

## 1. Kontext

- Bis 30.06.2026: **SPREEFÜXXE**, seit 01.07.2026: **„Füchse Berlin Frauen"**.
- Bestehende Seite (fuechseberlinfrauen.de) ist faktisch die alte Spreefüxxe-Seite mit neuem Namen — ohne eigene Tools/Features.
- Ziel: Marke „Füchse Berlin Frauen" pushen und etablieren; digitale Differenzierung in der Liga.

## 2. Zwei Leitplanken

1. **Frontend:** interaktive Features — Tools, Rechner, Live-/Matchday-Elemente.
2. **Backend/Pflege:** für Nina (Co-Trainerin + Social Media, keine Entwicklerin) kinderleicht. Tabelle, Spielplan, Ergebnisse automatisch aus externen Quellen. Nina pflegt nur Redaktionelles (News, Kader, Sponsoren) über einen Editor.

## 3. Design-Richtung

- CI Füchse Berlin: Grün-Töne, „Revier"-Bildsprache, sportlich, modern (Referenz-Tonalität: fuechse.berlin).
- Mobile-first.
- Große emotionale Bilder, klare Typo, schnelle Ladezeiten.
- Matchday-Center app-artig (Richtung PWA), ohne native App.

## 4. Sitemap

```
/                     Startseite
/team                 Mannschaft
/team/[spielerin]     Spielerin-Profil
/spielplan            Spielplan
/tabelle              Tabelle
/matchday             Live-/Matchday-Center
/news                 News-Übersicht
/news/[slug]          News-Detail
/tools                Fan-Tools-Hub
/tools/tippspiel      Spieltags-Tippspiel
/tools/szenario       Aufstiegs-/Szenario-Rechner
/fanzone              Fanzone
/sponsoren            Sponsoren
/verein               Über den Verein
/kontakt              Kontakt & Anfahrt
```

## 5. Phasen

**Phase 1 (jetzt):** Layout, alle Seiten als Skeleton/Platzhalter, Startseite mit Modulen, Mock-Daten, CI-Tokens. Deploy auf Vercel.

**Phase 2:** Live-Daten (handball.net), Matchday-Center, Tippspiel, Szenario-Rechner, CMS für Nina.

**Phase 3:** Fanzone-Mechaniken, Social-Aggregation, optional Banner/Hallenmagazin, A11y.

## 6. Tech-Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Aufbau analog GND (`src/`, Design-Tokens), ohne Neon/Drizzle/Auth in Phase 1
- Hosting: Vercel
- CMS später: Payload / Sanity / Storyblok

## 7. Anti-Pattern (vs. Herren-Seite)

- Kein Agentur-Lock-in — editorfreundlich, selbst pflegbar
- Security/Updates von Anfang an
- Datenquellen: handball.net + Sportdeutschland.TV (nicht Sportradar/DYN)

## 8. Nicht-Ziele (jetzt)

- Keine native App
- Kein Shop/Ticketing selbst bauen
- Phase 1: keine echten Daten, kein CMS
