# Füchse Berlin Frauen

Offizielle Vereinswebsite (Next.js) — Phase 1: Struktur, CI, Mock-Daten, Vercel-ready.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Design-Tokens unter `src/design-system/` (analog GND, schlank ohne DB/Auth)

## Lokal starten

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Scripts

| Befehl | Zweck |
|--------|--------|
| `npm run dev` | Dev-Server (Turbopack) |
| `npm run build` | Production-Build |
| `npm start` | Production-Server |
| `npm run lint` | ESLint |

## Live

- **Production:** https://fuechse-berlin-frauen.vercel.app
- Vercel-Projekt: `vibetastic/fuechse-berlin-frauen`

## Deploy auf Vercel

Bereits verknüpft. Erneut deployen:

```bash
npx vercel --prod
```

GitHub-Remote (optional, für Auto-Deploy bei Push) — zuerst `gh auth login`, dann:

```bash
gh repo create fuechse-berlin-frauen --private --source=. --remote=origin --push
```

Danach im Vercel-Dashboard das GitHub-Repo an das bestehende Projekt hängen.

## Ordnerstruktur

```
docs/PROJEKT-BRIEF.md
src/
  app/(public)/     # Sitemap-Routen
  components/       # layout, match, news, players, sponsors, ui
  data/             # Mock-JSON (später austauschbar)
  design-system/    # CI-Tokens
  lib/              # data helpers, format
```

## Nächste Schritte

- Phase 2: handball.net, Matchday live, Tippspiel, Szenario-Rechner, CMS für Nina
- Phase 3: Fanzone-Mechaniken, Social-Aggregation
