# Füchse Berlin Frauen — Leitplanken

## Harte Anforderungen

1. **Frontend:** interaktive Fan-Tools, Rechner, Matchday-Elemente als Differenzierung.
2. **Pflege:** Nina-freundlich. Spielplan/Tabelle/Ergebnisse nie manuell — später Auto-Fetch (handball.net). Redaktionelles (News, Kader, Sponsoren) über CMS-Editor.

## Design

- CI Füchse Berlin: Grün, Revier-Bildsprache, sportlich, modern.
- Mobile-first. Große Bilder, klare Typo, schnelle Loads.
- Matchday Richtung PWA-Gefühl, keine native App.

## Tech

- Next.js App Router + TypeScript + Tailwind v4
- `src/`-Layout wie GND, Design-Tokens unter `src/design-system/`
- Phase 1: Mock-JSON in `src/data/`, kein CMS, keine DB/Auth
- Hosting: Vercel
- Daten später: handball.net + Sportdeutschland.TV

## Anti-Pattern

- Kein Agentur-Lock-in
- Security/Updates mitdenken
- Nicht Herren-Rechtequellen (Sportradar/DYN) für Liga-Daten

## Scope Phase 1

Sitemap-Skeleton, wiederverwendbare Komponenten, Startseite mit Mock-Daten. Kein Shop/Ticketing, keine native App.
